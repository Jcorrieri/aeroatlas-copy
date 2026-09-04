from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import create_database_engine, get_database_session
from app.main import app
from app.models import Base


@pytest.fixture
def database(tmp_path: Path) -> Generator[Session, None, None]:
    engine = create_database_engine(f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as session:
        yield session
    engine.dispose()


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        cors_origins=("http://localhost:3000",),
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        session_cookie_name="aeroatlas_session",
        session_days=30,
        cookie_secure=False,
    )


@pytest.fixture
def client(database: Session, settings: Settings) -> Generator[TestClient, None, None]:
    def override_database():
        yield database

    app.dependency_overrides[get_database_session] = override_database
    app.dependency_overrides[get_settings] = lambda: settings

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def registered_client(client: TestClient) -> TestClient:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "traveler@example.com",
            "display_name": "Traveler",
            "password": "safe-password",
        },
    )
    assert response.status_code == 201
    return client


@pytest.fixture
def trip_payload() -> dict:
    return {
        "destination_name": "London, United Kingdom",
        "start_date": "2026-10-01",
        "end_date": "2026-10-07",
        "trip_type": "Personal",
    }
