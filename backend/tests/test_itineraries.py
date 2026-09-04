import asyncio


TRIP_QUERY = {
    "lat": "30.0",
    "lon": "-81.0",
    "from": "2026-09-10",
    "to": "2026-09-12",
    "type": "vacation",
}

ITEM = {
    "place_id": "place-1",
    "name": "Museum",
    "address": "1 Main Street",
    "lat": 30.1,
    "lon": -81.1,
    "category": "attraction",
    "trip_lat": TRIP_QUERY["lat"],
    "trip_lon": TRIP_QUERY["lon"],
    "trip_from": TRIP_QUERY["from"],
    "trip_to": TRIP_QUERY["to"],
    "trip_type": TRIP_QUERY["type"],
}


def test_empty_itinerary(client_factory):
    async def scenario():
        async with client_factory() as client:
            return await client.get("/api/itinerary", params=TRIP_QUERY)

    response = asyncio.run(scenario())
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Itinerary retrieved successfully",
        "itinerary": [],
    }


def test_itinerary_add_get_delete_round_trip(client_factory):
    async def scenario():
        async with client_factory() as client:
            added = await client.post("/api/itinerary/add", json=ITEM)
            fetched = await client.get("/api/itinerary", params=TRIP_QUERY)
            duplicate = await client.post("/api/itinerary/add", json=ITEM)
            deleted = await client.request(
                "DELETE",
                "/api/itinerary/delete",
                json=ITEM,
            )
            empty = await client.get("/api/itinerary", params=TRIP_QUERY)
            return added, fetched, duplicate, deleted, empty

    added, fetched, duplicate, deleted, empty = asyncio.run(scenario())
    assert added.status_code == 200
    assert added.json()["message"] == "Place added to itinerary"
    assert added.json()["itinerary"] == [
        {
            "id": 1,
            "place_id": "place-1",
            "day": 1,
            "time": "12:00 PM",
            "activity": "Visit Museum",
            "location": "1 Main Street",
            "duration": "2 hours",
            "category": "attraction",
            "lat": 30.1,
            "lon": -81.1,
        }
    ]

    assert fetched.json()["itinerary"] == added.json()["itinerary"]

    assert duplicate.json()["message"] == "Place already in itinerary"
    assert len(duplicate.json()["itinerary"]) == 1

    assert deleted.json() == {
        "success": True,
        "message": "Item removed",
        "itinerary": [],
    }

    assert empty.json()["itinerary"] == []


def test_delete_missing_itinerary_keeps_existing_contract(client_factory):
    async def scenario():
        async with client_factory() as client:
            return await client.request(
                "DELETE",
                "/api/itinerary/delete",
                json=ITEM,
            )

    response = asyncio.run(scenario())
    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "Itinerary Not found",
        "itinerary": [],
    }
