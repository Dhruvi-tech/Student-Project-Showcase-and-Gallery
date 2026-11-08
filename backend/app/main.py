import logging
import json
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from fastapi.encoders import jsonable_encoder
from app.config import settings
from app.database import init_db
from app.routers import projects_router, health_router, auth_router, github_router
from app.routers.discovery import router as discovery_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("showcase.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables
    logger.info("Initializing Student Project Showcase API...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    # Shutdown
    logger.info("Shutting down Student Project Showcase API...")


app = FastAPI(
    title="Student Project Showcase & Peer Gallery API",
    description=(
        "A Cloud-Native REST API for publishing, ranking, and discussing university student "
        "projects. Built for CS3452 'Cloud Platforms and Service Models' at RV University."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def structured_request_log(request: Request, call_next):
    """Emit CloudWatch-compatible JSON without logging secrets or request bodies."""
    request_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request_failed %s", json.dumps({
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
        }))
        raise
    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    response.headers["X-Request-Id"] = request_id
    logger.info("request_completed %s", json.dumps({
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": elapsed_ms,
    }))
    return response

# Include API Routers
app.include_router(health_router)
app.include_router(projects_router)
app.include_router(auth_router)
app.include_router(discovery_router)
app.include_router(github_router)


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount frontend production build if present
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist) and os.path.isdir(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/favicon.ico", include_in_schema=False)
    @app.get("/vite.svg", include_in_schema=False)
    def serve_icons():
        icon_path = os.path.join(frontend_dist, "vite.svg")
        if os.path.exists(icon_path):
            return FileResponse(icon_path)
        return JSONResponse(status_code=404, content={"detail": "Not found"})

    @app.get("/", tags=["Frontend"])
    def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {
            "service": "Student Project Showcase & Peer Gallery API",
            "status": "online",
            "docs_url": "/docs",
            "health_check": "/health",
        }

    @app.get("/{full_path:path}", tags=["Frontend"])
    def serve_spa(full_path: str):
        if full_path.startswith(("api", "health", "docs", "redoc", "openapi.json")):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not found"})
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "service": "Student Project Showcase & Peer Gallery API",
            "status": "online",
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "health_check": "/health",
            "api_v1_projects": "/api/v1/projects",
            "course": "CS3452 Cloud Platforms and Service Models",
        }


# Standardized error response handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": jsonable_encoder(exc.errors()),
            "message": "The submitted payload failed schema validation",
        },
    )
