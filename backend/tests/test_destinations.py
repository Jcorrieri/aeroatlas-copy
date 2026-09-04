import asyncio

from app.core.dependencies import get_destination_service
from app.main import app


DESTINATION_DATA = {
    "cityName": "London",
    "country": "United Kingdom",
    "description": "A city.",
    "countryIcon": {"imageUrl": "https://example.test/flag.png", "alt": "UK flag"},
    "itinerary": [],
    "images": [{"id": "1", "url": "https://example.test/image.jpg"}],
    "weatherSummary": {"averageTemperature": 28, "condition": "Sunny", "humidity": 65},
    "travelDetails": {
        "type": "flight",
        "departure": "Jacksonville, USA",
        "arrival": "London, United Kingdom",
        "departureDate": "2026-09-10",
        "returnDate": "2026-09-12",
        "flightUrl": "https://example.test/flights",
    },
    "tripType": "vacation",
    "requiredItems": ["Passport"],
}


class FakeDestinationService:
    async def get_destination(self, **_kwargs):
        return DESTINATION_DATA


def test_destination_route_keeps_existing_contract(client_factory):
    async def get_fake_service():
        return FakeDestinationService()

    app.dependency_overrides[get_destination_service] = get_fake_service

    async def scenario():
        async with client_factory() as client:
            return await client.get(
                "/destinations/info/",
                params={
                    "lat": "51.5",
                    "lon": "-0.1",
                    "from_": "2026-09-10T00:00:00",
                    "to": "2026-09-12T00:00:00",
                    "trip_type": "vacation",
                    "location": "London, United Kingdom",
                },
            )

    response = asyncio.run(scenario())
    assert response.status_code == 200
    assert response.json() == DESTINATION_DATA
