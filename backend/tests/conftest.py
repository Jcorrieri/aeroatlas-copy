from contextlib import asynccontextmanager

import httpx
import pytest

from app.core.config import get_settings
from app.core.lifecycle import lifespan
from app.main import app


@pytest.fixture
def client_factory(tmp_path, monkeypatch):
    monkeypatch.setenv("CACHE_PATH", str(tmp_path / "cache"))
    monkeypatch.delenv("UNSPLASH_API_KEY", raising=False)
    monkeypatch.delenv("IMG_KEY", raising=False)
    get_settings.cache_clear()
    app.dependency_overrides.clear()

    @asynccontextmanager
    async def make_client():
        async with lifespan(app):
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://testserver",
            ) as client:
                yield client

    yield make_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()
