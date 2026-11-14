import logging
import json
import time
import uuid
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.openapi.utils import get_openapi

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

    # Safe initial catalog seed if empty
    try:
        from app.database import SessionLocal
        from app.models.project import Project
        from seed_data import seed_database
        db = SessionLocal()
        project_count = db.query(Project).count()
        db.close()
        if project_count == 0:
            logger.info("Database is empty. Populating initial seed catalog...")
            seed_database(reset=False)
            logger.info("Initial catalog population complete.")
        else:
            logger.info("Database already contains %d projects; skipping initial seed.", project_count)
    except Exception as exc:
        logger.warning("Catalog seed check: %s", exc)

    yield
    # Shutdown
    logger.info("Shutting down Student Project Showcase API...")


app = FastAPI(
    title="Student Project Showcase & Peer Gallery REST API",
    description=(
        "A Production-Grade Cloud-Native RESTful Web Service and Peer Gallery for publishing, "
        "ranking, discovering, and reviewing student software projects.\n\n"
        "Designed and implemented in compliance with **CS3302 – Development of Web Services**:\n"
        "- **Module 1**: Fundamentals of Web Services, Service Provider/Consumer, SOA & HTTP Protocol\n"
        "- **Module 2**: RESTful Web Service Design, URI Hierarchy, CRUD (GET/POST/PUT/PATCH/DELETE), Filtering/Sorting/Pagination & OpenAPI\n"
        "- **Module 3**: FastAPI Web Service Development, Modular Routing, Schema Validation & Structured Error Handling\n"
        "- **Module 4**: SQLAlchemy ORM, PostgreSQL/SQLite Persistence, JWT Authentication, PBKDF2 Password Hashing & Access Control\n"
        "- **Module 5**: Cloud Deployment (Render PaaS & PostgreSQL), Docker Containerization & Microservice Decomposition Principles"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
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
    """Emit structured JSON log without logging secrets or request bodies."""
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
            "course": "CS3302 Development of Web Services",
            "modules": {
                "module_1": "Fundamentals of Web Services & SOA",
                "module_2": "RESTful Web Service Design & OpenAPI",
                "module_3": "FastAPI Web Service Development & CRUD",
                "module_4": "Data Integration (PostgreSQL/SQLAlchemy) & JWT Security",
                "module_5": "Cloud Deployment & Containerization",
            },
        }


# Standardized error response handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", status.HTTP_422_UNPROCESSABLE_ENTITY),
        content={
            "error": "Validation Error",
            "detail": jsonable_encoder(exc.errors()),
            "message": "The submitted payload failed schema validation",
        },
    )


def custom_openapi():
    """Generates enhanced OpenAPI schema with JWT Bearer security scheme."""
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema.setdefault("components", {})
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token obtained from /api/v1/auth/login or /api/v1/auth/demo-login",
        }
    }
    # Add Bearer security requirement for protected routes
    for path, methods in openapi_schema.get("paths", {}).items():
        for method, details in methods.items():
            tags = details.get("tags", [])
            if any(t in tags for t in ["Authentication", "Projects", "Discovery"]):
                details.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
