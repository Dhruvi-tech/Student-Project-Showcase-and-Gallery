import logging
import time
import uuid
from typing import Generator, Tuple
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("showcase.database")

# Handle SQLite vs PostgreSQL engine parameters
is_sqlite = settings.resolved_database_url.startswith("sqlite")

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
    settings.resolved_database_url,
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
    resolved_url = settings.resolved_database_url
    safe_url = resolved_url.split("@")[-1] if "@" in resolved_url else resolved_url
    logger.info("Initializing database using: %s", safe_url)
    Base.metadata.create_all(bind=engine)
    # Additive upgrade for existing databases created before dislikes were introduced.
    columns = {column["name"] for column in inspect(engine).get_columns("projects")}
    if "downvote_count" not in columns:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE projects ADD COLUMN downvote_count INTEGER NOT NULL DEFAULT 0"
            ))
    if "category" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE projects ADD COLUMN category VARCHAR(80) NOT NULL DEFAULT 'Other'"))
    if "thumbnail_key" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE projects ADD COLUMN thumbnail_key VARCHAR(500)"))
    for column_name, column_sql in (
        ("difficulty", "VARCHAR(20) NOT NULL DEFAULT 'Intermediate'"),
        ("docs_url", "VARCHAR(500)"),
        ("author_display_name", "VARCHAR(120)"),
        ("author_profile_url", "VARCHAR(500)"),
    ):
        if column_name not in columns:
            with engine.begin() as connection:
                connection.execute(text(f"ALTER TABLE projects ADD COLUMN {column_name} {column_sql}"))
    with engine.begin() as connection:
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_projects_category ON projects (category)"))
    comment_columns = {column["name"] for column in inspect(engine).get_columns("comments")}
    if "feedback_type" not in comment_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE comments ADD COLUMN feedback_type VARCHAR(20)"))
    student_columns = {column["name"] for column in inspect(engine).get_columns("students")}
    for column_name, column_sql in (
        ("username", "VARCHAR(40)"),
        ("password_hash", "VARCHAR(255)"),
        ("bio", "VARCHAR(500)"),
        ("session_version", "INTEGER NOT NULL DEFAULT 0"),
        ("interests", "JSON NOT NULL DEFAULT '[]'"),
    ):
        if column_name not in student_columns:
            with engine.begin() as connection:
                connection.execute(text(f"ALTER TABLE students ADD COLUMN {column_name} {column_sql}"))
    with engine.begin() as connection:
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_students_username ON students (username)"))

    # Canonicalize only the legacy labels that are unambiguous in the new 20-domain taxonomy.
    with engine.begin() as connection:
        connection.execute(text("UPDATE projects SET category = 'Web Development & Full Stack' WHERE lower(category) = 'web development'"))
        connection.execute(text("UPDATE projects SET category = 'Mobile App Development' WHERE lower(category) = 'mobile development'"))
        connection.execute(text("UPDATE projects SET category = 'Blockchain & Web3' WHERE lower(category) = 'blockchain'"))
        connection.execute(text("UPDATE projects SET category = 'Open Source & Developer Utilities' WHERE lower(category) = 'other' OR category IS NULL OR category = ''"))

    # Fold the legacy like/dislike tables into one table whose unique key spans both directions.
    table_names = set(inspect(engine).get_table_names())
    with engine.begin() as connection:
        for table_name, direction in (("upvotes", "up"), ("downvotes", "down")):
            if table_name not in table_names:
                continue
            for row in connection.execute(text(f"SELECT project_id, student_id, created_at FROM {table_name}")).mappings():
                existing = connection.execute(text(
                    "SELECT direction FROM project_votes WHERE project_id = :project_id AND student_id = :student_id"
                ), {"project_id": row["project_id"], "student_id": row["student_id"]}).first()
                if not existing:
                    connection.execute(text(
                        "INSERT INTO project_votes (id, project_id, student_id, direction, created_at) "
                        "VALUES (:id, :project_id, :student_id, :direction, :created_at)"
                    ), {"id": f"vte_{uuid.uuid4().hex[:12]}", "project_id": row["project_id"],
                        "student_id": row["student_id"], "direction": direction, "created_at": row["created_at"]})
        connection.execute(text(
            "UPDATE projects SET "
            "upvote_count = (SELECT COUNT(*) FROM project_votes WHERE project_votes.project_id = projects.id AND direction = 'up'), "
            "downvote_count = (SELECT COUNT(*) FROM project_votes WHERE project_votes.project_id = projects.id AND direction = 'down')"
        ))


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
