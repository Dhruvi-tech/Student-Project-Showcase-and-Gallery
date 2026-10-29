import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    AUTH_SECRET: str = os.getenv("AUTH_SECRET", "development-only-change-this-secret")
    DEMO_MODE: bool = os.getenv(
        "DEMO_MODE",
        "false" if os.getenv("ENVIRONMENT", "development").lower() == "production" else "true",
    ).lower() in ("true", "1", "yes")

    # Primary database URL (PostgreSQL by default in production/Docker, SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./showcase.db"
    )
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "")
    DATABASE_PORT: int = int(os.getenv("DATABASE_PORT", "5432"))
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "")
    DATABASE_USER: str = os.getenv("DATABASE_USER", "")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "")
    DATABASE_SSLMODE: str = os.getenv("DATABASE_SSLMODE", "")

    # CORS origins
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    )

    # Optional object storage; leave the bucket empty for local development.
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def resolved_database_url(self) -> str:
        """Compose a safe SQLAlchemy URL from separately injected cloud secrets when configured."""
        if self.DATABASE_HOST and self.DATABASE_NAME and self.DATABASE_USER and self.DATABASE_PASSWORD:
            query = {"sslmode": self.DATABASE_SSLMODE} if self.DATABASE_SSLMODE else {}
            return URL.create(
                "postgresql+psycopg2", username=self.DATABASE_USER, password=self.DATABASE_PASSWORD,
                host=self.DATABASE_HOST, port=self.DATABASE_PORT, database=self.DATABASE_NAME, query=query,
            ).render_as_string(hide_password=False)
        return self.DATABASE_URL


settings = Settings()
