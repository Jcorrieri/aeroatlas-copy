import asyncio
from pathlib import Path

import httpx

from app.core.config import Settings
from app.services.destination_service import DestinationService, FALLBACK_IMAGE_URL


def make_settings(api_key: str | None) -> Settings:
    return Settings(
        cors_origins=("http://localhost:3000",),
        provider_user_agent="aeroatlas-tests/1.0",
        unsplash_api_key=api_key,
        cache_path=Path("data_cache"),
        http_timeout_seconds=10,
    )


async def unused_handler(_request):
    raise AssertionError("HTTP should not be called without an API key")


def test_missing_unsplash_key_uses_fallback():
    async def get_images():
        transport = httpx.MockTransport(unused_handler)
        async with httpx.AsyncClient(transport=transport) as client:
            service = DestinationService({}, client, make_settings(None))
            return await service.get_place_images("London", None, "United Kingdom")

    images = asyncio.run(get_images())
    assert images == [FALLBACK_IMAGE_URL]


def test_unsplash_error_returns_a_list():
    response = httpx.Response(status_code=503)

    assert DestinationService._parse_images(response) == [FALLBACK_IMAGE_URL]


def test_legacy_cached_image_string_is_normalized():
    cached = "https://example.test/one.jpg,https://example.test/two.jpg"

    assert DestinationService._normalize_cached_images(cached) == [
        "https://example.test/one.jpg",
        "https://example.test/two.jpg",
    ]
