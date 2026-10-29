import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from fastapi.encoders import jsonable_encoder
from app.config import settings
from app.database import init_db
from app.routers import projects_router, health_router, auth_router
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

# Include API Routers
app.include_router(health_router)
app.include_router(projects_router)
app.include_router(auth_router)
app.include_router(discovery_router)


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
