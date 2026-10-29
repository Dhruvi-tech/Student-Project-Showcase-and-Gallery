import os
import sys
from contextlib import asynccontextmanager
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, get_db
from app.main import app
from app.routers import health
from app.models.student import Student

# Use an isolated in-memory SQLite database for all automated tests
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@asynccontextmanager
async def test_lifespan(_app):
    """Keep app startup migrations away from the developer's local database."""
    yield


@pytest.fixture(scope="function")
def db_session():
    """Provides a cleanly isolated database session for each test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed default test students
    student1 = Student(
        id="stu_test_alpha",
        name="Alpha Tester",
        email="alpha@rvu.edu.in",
        roll_number="RVU_TEST_01",
    )
    student2 = Student(
        id="stu_test_beta",
        name="Beta Reviewer",
        email="beta@rvu.edu.in",
        roll_number="RVU_TEST_02",
    )
    session.add_all([student1, student2])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    original_lifespan = app.router.lifespan_context
    original_health_check = health.check_db_health
    app.router.lifespan_context = test_lifespan
    health.check_db_health = lambda: (True, "Connected to isolated SQLite test database", 0.0)
    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.router.lifespan_context = original_lifespan
        health.check_db_health = original_health_check
