# AeroAtlas backend

This is the FastAPI API for local accounts, trips, and itinerary items. See
[`../BACKEND.md`](../BACKEND.md) for the architecture and API contract.

From this directory:

```bash
uv sync --locked
uv run alembic upgrade head
uv run fastapi dev app/main.py
uv run pytest
```

SQLite is used by default. Copy `.env.example` to `.env` only when overriding local settings; no
third-party API keys are required for this MVP.
