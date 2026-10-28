import logging
import time
from typing import Generator, Tuple
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("showcase.database")

# Handle SQLite vs PostgreSQL engine parameters
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

connect_args = {}
engine_kwargs = {"echo": False}

if is_sqlite:
    connect_args["check_same_thread"] = False
else:
    engine_kwargs.update(
        {
            "pool_pre_ping": True,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_recycle": 1800,
        }
    )

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables defined on Base."""
    logger.info(f"Initializing database using: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    # Additive upgrade for existing databases created before dislikes were introduced.
    columns = {column["name"] for column in inspect(engine).get_columns("projects")}
    if "downvote_count" not in columns:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE projects ADD COLUMN downvote_count INTEGER NOT NULL DEFAULT 0"
            ))
    comment_columns = {column["name"] for column in inspect(engine).get_columns("comments")}
    if "feedback_type" not in comment_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE comments ADD COLUMN feedback_type VARCHAR(20)"))


def check_db_health() -> Tuple[bool, str, float]:
    """
    Executes a lightweight query (SELECT 1) to verify database connectivity.
    Returns: (is_healthy, message, response_time_ms)
    """
    start_time = time.perf_counter()
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        dialect = "SQLite" if is_sqlite else "PostgreSQL"
        return True, f"Connected to {dialect} successfully", latency_ms
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"Database health check failed: {str(e)}")
        return False, f"Database connectivity error: {str(e)}", latency_ms
