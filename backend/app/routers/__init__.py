from app.routers.projects import router as projects_router
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router

__all__ = ["projects_router", "health_router", "auth_router"]
