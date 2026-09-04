import asyncio
from typing import Any, MutableMapping
from urllib.parse import urlencode

import httpx
import wikipediaapi

from app.core.config import Settings


NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
FLAG_IMAGE_URL = "https://flagcdn.com/w80/{country_code}.png"
UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"
FALLBACK_IMAGE_URL = (
    "https://images.unsplash.com/photo-1478860409698-8707f313ee8b"
    "?q=80&w=2070&auto=format&fit=crop"
)
GOOGLE_FLIGHTS_URL = "https://www.google.com/travel/flights"
DEFAULT_DEPARTURE = "Jacksonville, USA"


class DestinationProviderError(Exception):
    """Raised when required destination provider data cannot be loaded."""


class DestinationService:
    def __init__(
        self,
        cache: MutableMapping[str, Any],
        http_client: httpx.AsyncClient,
        settings: Settings,
    ) -> None:
        self.cache = cache
        self.http_client = http_client
        self.settings = settings

    async def get_flag_image(
        self,
        lat: float,
        lon: float,
        country: str,
    ) -> str:
        cache_key = f"{country}_flag"
        if cache_key in self.cache:
            return self.cache[cache_key]

        response = await self.http_client.get(
            NOMINATIM_REVERSE_URL,
            params={"format": "json", "lat": lat, "lon": lon},
            headers={"User-Agent": self.settings.provider_user_agent},
        )
        if response.status_code != 200:
            raise DestinationProviderError("Failed to fetch country code")

        country_code = response.json()["address"]["country_code"].lower()
        image_url = FLAG_IMAGE_URL.format(country_code=country_code)
        self.cache[cache_key] = image_url
        return image_url

    def get_description(self, city: str, state: str | None, country: str) -> str:
        cache_key = f"{city}_{country}_desc"
        if cache_key in self.cache:
            return self.cache[cache_key]

        wikipedia = wikipediaapi.Wikipedia(
            user_agent=self.settings.provider_user_agent,
            language="en",
        )
        page = wikipedia.page(f"{city}, {state or country}")
        if not page.exists():
            return "Failed to load description"

        description = page.summary[:650]
        description = description[: description.rfind(".") + 1]
        self.cache[cache_key] = description
        return description

    async def get_place_images(
        self,
        city: str,
        state: str | None,
        country: str,
    ) -> list[str]:
        cache_key = f"{city}_{country}_images"
        cached_images = self.cache.get(cache_key)
        if cached_images is not None:
            return self._normalize_cached_images(cached_images)

        if not self.settings.unsplash_api_key:
            return [FALLBACK_IMAGE_URL]

        response = await self.http_client.get(
            UNSPLASH_SEARCH_URL,
            params={
                "query": f"{city}, {state or country}",
                "client_id": self.settings.unsplash_api_key,
                "content_filter": "high",
            },
        )
        images = self._parse_images(response)
        self.cache[cache_key] = images
        return images

    @staticmethod
    def _normalize_cached_images(cached_images: Any) -> list[str]:
        if isinstance(cached_images, str):
            values = (value.strip() for value in cached_images.split(","))
            return list(dict.fromkeys(value for value in values if value))[:3]
        return list(cached_images)

    @staticmethod
    def _parse_images(response: httpx.Response) -> list[str]:
        if response.status_code != 200:
            return [FALLBACK_IMAGE_URL]

        images = list(
            dict.fromkeys(
                item["urls"]["regular"]
                for item in response.json().get("results", [])
                if item.get("urls", {}).get("regular")
            )
        )[:3]
        while len(images) < 3:
            images.append(FALLBACK_IMAGE_URL)
        return images

    async def get_destination(
        self,
        lat: float,
        lon: float,
        trip_from: str,
        trip_to: str,
        trip_type: str,
        location: str,
    ) -> dict[str, Any]:
        parts = location.strip().split(", ")
        city, country = parts[0], parts[-1]
        state = parts[-3] if country == "USA" else None
        trip_from, trip_to = trip_from[:10], trip_to[:10]

        flag = await self.get_flag_image(lat, lon, country)
        description = await asyncio.to_thread(
            self.get_description,
            city,
            state,
            country,
        )
        image_urls = await self.get_place_images(city, state, country)
        itinerary = self._get_itinerary(lat, lon, trip_from, trip_to, trip_type)

        return self._build_destination(
            city=city,
            country=country,
            trip_from=trip_from,
            trip_to=trip_to,
            trip_type=trip_type,
            flag=flag,
            description=description,
            image_urls=image_urls,
            itinerary=itinerary,
        )

    def _get_itinerary(
        self,
        lat: float,
        lon: float,
        trip_from: str,
        trip_to: str,
        trip_type: str,
    ) -> list[dict[str, Any]]:
        trip_key = f"{lat}_{lon}_{trip_from}_{trip_to}_{trip_type}"
        return self.cache.get(f"{trip_key}_itinerary", [])

    @staticmethod
    def _build_destination(
        city: str,
        country: str,
        trip_from: str,
        trip_to: str,
        trip_type: str,
        flag: str,
        description: str,
        image_urls: list[str],
        itinerary: list[dict[str, Any]],
    ) -> dict[str, Any]:
        query = (
            f"from {DEFAULT_DEPARTURE} to {city}, {country} "
            f"on {trip_from} through {trip_to}"
        )
        flight_query = urlencode({"q": query})
        return {
            "cityName": city,
            "country": country,
            "description": description,
            "countryIcon": {"imageUrl": flag, "alt": f"{country} flag"},
            "itinerary": itinerary,
            "images": [
                {"id": str(index), "url": url}
                for index, url in enumerate(image_urls, start=1)
            ],
            "weatherSummary": {
                "averageTemperature": 28,
                "condition": "Sunny",
                "humidity": 65,
            },
            "travelDetails": {
                "type": "flight",
                "departure": DEFAULT_DEPARTURE,
                "arrival": f"{city}, {country}",
                "departureDate": trip_from,
                "returnDate": trip_to,
                "flightUrl": f"{GOOGLE_FLIGHTS_URL}?{flight_query}",
            },
            "tripType": trip_type,
            "requiredItems": ["Passport"] if country != "USA" else [],
        }
