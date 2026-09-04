import uuid

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import ItineraryItem


def create_trip(client: TestClient, payload: dict) -> dict:
    response = client.post("/api/v1/trips", json=payload)
    assert response.status_code == 201
    return response.json()


def item_payload(name: str = "British Museum", day_number: int = 1) -> dict:
    return {
        "name": name,
        "address": "Great Russell Street",
        "latitude": 51.5194,
        "longitude": -0.1269,
        "category": "attraction",
        "day_number": day_number,
    }


def test_trip_crud_and_defaults(registered_client: TestClient, trip_payload: dict):
    trip = create_trip(registered_client, trip_payload)
    assert trip["title"] == "Trip to London, United Kingdom"
    assert trip["latitude"] is None

    listed = registered_client.get("/api/v1/trips")
    assert [item["id"] for item in listed.json()] == [trip["id"]]

    updated = registered_client.patch(
        f"/api/v1/trips/{trip['id']}",
        json={"title": "Autumn in London", "latitude": 51.5, "longitude": -0.1},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Autumn in London"
    assert updated.json()["items"] == []

    deleted = registered_client.delete(f"/api/v1/trips/{trip['id']}")
    assert deleted.status_code == 204
    assert registered_client.get(f"/api/v1/trips/{trip['id']}").status_code == 404


def test_trip_validation(client: TestClient, registered_client: TestClient, trip_payload: dict):
    invalid_dates = trip_payload | {"end_date": "2026-09-01"}
    one_coordinate = trip_payload | {"latitude": 51.5}

    assert client.post("/api/v1/trips", json=invalid_dates).status_code == 422
    assert client.post("/api/v1/trips", json=one_coordinate).status_code == 422

    trip = create_trip(registered_client, trip_payload)
    assert registered_client.patch(
        f"/api/v1/trips/{trip['id']}", json={"title": "   "}
    ).status_code == 422


def test_item_crud_and_ordering(registered_client: TestClient, trip_payload: dict):
    trip = create_trip(registered_client, trip_payload)
    first = registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload("Dinner", 2),
    )
    second = registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload("Museum", 1),
    )
    duplicate = registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload("Museum", 1),
    )

    assert first.status_code == second.status_code == duplicate.status_code == 201
    items = registered_client.get(f"/api/v1/trips/{trip['id']}/items").json()
    assert [item["name"] for item in items] == ["Museum", "Museum", "Dinner"]
    assert [item["position"] for item in items[:2]] == [0, 1]

    item_id = second.json()["id"]
    updated = registered_client.patch(
        f"/api/v1/trips/{trip['id']}/items/{item_id}",
        json={"start_time": "09:30:00", "duration_minutes": 90},
    )
    assert updated.json()["start_time"] == "09:30:00"
    assert updated.json()["duration_minutes"] == 90

    assert registered_client.delete(
        f"/api/v1/trips/{trip['id']}/items/{item_id}"
    ).status_code == 204


def test_moving_item_appends_to_target_day(
    registered_client: TestClient,
    trip_payload: dict,
):
    trip = create_trip(registered_client, trip_payload)
    target_item = registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload("Already on day two", 2),
    ).json()
    moved_item = registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload("Move me", 1),
    ).json()

    response = registered_client.patch(
        f"/api/v1/trips/{trip['id']}/items/{moved_item['id']}",
        json={"day_number": 2},
    )

    assert target_item["position"] == 0
    assert response.status_code == 200
    assert response.json()["position"] == 1
    assert registered_client.patch(
        f"/api/v1/trips/{trip['id']}/items/{moved_item['id']}",
        json={"name": "   "},
    ).status_code == 422


def test_trip_ownership_is_hidden(client: TestClient, trip_payload: dict):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner@example.com",
            "display_name": "Owner",
            "password": "safe-password",
        },
    )
    trip = create_trip(client, trip_payload)
    item = client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload(),
    ).json()
    client.post("/api/v1/auth/logout")
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "other@example.com",
            "display_name": "Other",
            "password": "safe-password",
        },
    )

    assert client.get(f"/api/v1/trips/{trip['id']}").status_code == 404
    assert client.patch(f"/api/v1/trips/{trip['id']}", json={"title": "Stolen"}).status_code == 404
    assert client.delete(f"/api/v1/trips/{trip['id']}").status_code == 404
    items_url = f"/api/v1/trips/{trip['id']}/items"
    assert client.get(items_url).status_code == 404
    assert client.post(items_url, json=item_payload()).status_code == 404
    assert client.patch(f"{items_url}/{item['id']}", json={"name": "Stolen"}).status_code == 404
    assert client.delete(f"{items_url}/{item['id']}").status_code == 404

    other_trip = create_trip(client, trip_payload | {"title": "Other trip"})
    wrong_trip_url = f"/api/v1/trips/{other_trip['id']}/items/{item['id']}"
    assert client.patch(wrong_trip_url, json={"name": "Stolen"}).status_code == 404
    assert client.delete(wrong_trip_url).status_code == 404


def test_trip_delete_cascades_items(
    registered_client: TestClient,
    trip_payload: dict,
    database: Session,
):
    trip = create_trip(registered_client, trip_payload)
    registered_client.post(
        f"/api/v1/trips/{trip['id']}/items",
        json=item_payload(),
    )

    registered_client.delete(f"/api/v1/trips/{trip['id']}")
    count = database.scalar(select(func.count()).select_from(ItineraryItem))
    assert count == 0


def test_unauthenticated_trip_access(client: TestClient):
    assert client.get("/api/v1/trips").status_code == 401
    assert client.get(f"/api/v1/trips/{uuid.uuid4()}").status_code == 401
