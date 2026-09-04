from typing import Any

import httpx
from fastapi import Request

from app.core.config import Settings, get_settings
from app.services.destination_service import DestinationService
from app.services.itinerary_service import ItineraryService


def get_cache(request: Request) -> Any:
    return request.app.state.data_cache


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


async def get_itinerary_service(request: Request) -> ItineraryService:
    return ItineraryService(
        cache=get_cache(request),
        trip_counters=request.app.state.trip_counters,
    )


async def get_destination_service(request: Request) -> DestinationService:
    settings: Settings = get_settings()
    return DestinationService(
        cache=get_cache(request),
        http_client=get_http_client(request),
        settings=settings,
    )
