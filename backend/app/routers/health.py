from datetime import datetime, timezone
from fastapi import APIRouter, status, Response
from app.config import settings
from app.database import check_db_health

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Application & Database Liveness Probe",
    description="Returns service health status and database connectivity metrics for cloud load balancers and orchestrators.",
)
def health_check(response: Response):
    db_healthy, db_message, db_latency = check_db_health()

    status_str = "healthy" if db_healthy else "degraded"
    if not db_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": status_str,
        "service": "student-project-showcase-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "connected": db_healthy,
            "message": db_message,
            "latency_ms": db_latency,
            "engine": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        },
        "cloud_readiness": {
            "stateless": True,
            "twelve_factor_compliant": True,
            "probe_type": "liveness_and_readiness",
        },
    }
