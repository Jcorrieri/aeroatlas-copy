from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from diskcache import Cache
from fastapi import FastAPI

from app.core.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    app.state.data_cache = Cache(settings.cache_path)
    app.state.trip_counters = {}
    app.state.http_client = httpx.AsyncClient(timeout=settings.http_timeout_seconds)

    try:
        yield
    finally:
        await app.state.http_client.aclose()
        app.state.data_cache.close()
