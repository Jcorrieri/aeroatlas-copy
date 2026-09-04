# AeroAtlas backend

The backend is a small FastAPI application organized into routers, services, and shared core
resources. Existing frontend-facing route paths are retained during the initial refactor.

## Setup

The project requires Python 3.12 and [uv](https://docs.astral.sh/uv/).

```bash
uv sync --locked
```

API keys are not configured in the repository. Copy `.env.example` to `.env` only when real
values are available. Without an Unsplash key, destination images use the existing fallback.

## Run

From `backend/`:

```bash
uv run fastapi dev app/main.py
```

The root compatibility entrypoint also remains valid:

```bash
uv run fastapi dev main.py
```

## Test

```bash
uv run pytest
```
