from datetime import timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuthSession, utc_now


def registration_payload(email: str = "traveler@example.com") -> dict:
    return {
        "email": email,
        "display_name": " Traveler ",
        "password": "safe-password",
    }


def test_registration_signs_user_in(client: TestClient):
    response = client.post("/api/v1/auth/register", json=registration_payload())

    assert response.status_code == 201
    assert response.json()["email"] == "traveler@example.com"
    assert response.json()["display_name"] == "Traveler"
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "SameSite=lax" in response.headers["set-cookie"]
    assert client.get("/api/v1/auth/me").status_code == 200


def test_duplicate_email_and_invalid_login(client: TestClient):
    client.post("/api/v1/auth/register", json=registration_payload())
    duplicate = client.post(
        "/api/v1/auth/register",
        json=registration_payload("TRAVELER@example.com"),
    )
    invalid = client.post(
        "/api/v1/auth/login",
        json={"email": "traveler@example.com", "password": "wrong-password"},
    )

    assert duplicate.status_code == 409
    assert invalid.status_code == 401
    assert invalid.json() == {"detail": "Invalid email or password"}


def test_logout_revokes_session(registered_client: TestClient):
    response = registered_client.post("/api/v1/auth/logout")

    assert response.status_code == 204
    assert registered_client.get("/api/v1/auth/me").status_code == 401


def test_expired_session_is_rejected(
    registered_client: TestClient,
    database: Session,
):
    auth_session = database.scalar(select(AuthSession))
    assert auth_session is not None
    auth_session.expires_at = utc_now() - timedelta(minutes=1)
    database.commit()

    assert registered_client.get("/api/v1/auth/me").status_code == 401


def test_registration_rejects_blank_name(client: TestClient):
    payload = registration_payload()
    payload["display_name"] = "   "

    assert client.post("/api/v1/auth/register", json=payload).status_code == 422
