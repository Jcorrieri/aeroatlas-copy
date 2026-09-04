# AeroAtlas backend

## MVP scope

The backend supports local accounts and multiple trips per account. Each trip owns an ordered
collection of itinerary items. This is a deliberately small foundation for the existing product,
not a final production architecture.

The frontend migration, OAuth, email verification, password recovery, live place search, provider
enrichment, and Unsplash integration are deferred. The old cache-based itinerary and destination
endpoints have been removed rather than retained as compatibility routes.

## Project structure

```text
backend/
├── alembic/                  # Database migrations
├── app/
│   ├── main.py               # FastAPI app, middleware, and router registration
│   ├── models.py             # Cohesive SQLAlchemy persistence models
│   ├── schemas.py            # Public request and response contracts
│   ├── core/
│   │   ├── config.py         # Environment-backed settings
│   │   ├── database.py       # Engine and database-session lifecycle
│   │   └── dependencies.py   # FastAPI dependency wiring
│   ├── routers/
│   │   ├── auth_router.py    # Account and session HTTP endpoints
│   │   └── trips_router.py   # Trip and nested itinerary-item endpoints
│   └── services/
│       ├── auth_service.py   # Password and session behavior
│       └── trip_service.py   # Owned trip and item behavior
├── tests/
├── .env.example
├── alembic.ini
├── pyproject.toml
└── uv.lock
```

The request flow is `router -> service -> database`. Routers own HTTP details, services own
application behavior, and `core/` owns shared configuration and resources. Keep schemas and models
cohesive until their size creates a real navigation problem; do not add repository layers or
interfaces merely for architectural symmetry.

## API

All application routes use `/api/v1`.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Trips | `POST /trips`, `GET /trips`, `GET/PATCH/DELETE /trips/{trip_id}` |
| Items | `GET/POST /trips/{trip_id}/items`, `PATCH/DELETE /trips/{trip_id}/items/{item_id}` |

Registration logs the user in. Authentication uses an opaque token in an HTTP-only cookie; only a
hash of the token is stored. Trip queries are scoped to the current user and return `404` when the
resource belongs to another account.

A trip requires a destination and start/end dates. Coordinates are optional but must be supplied
as a pair. Item names and coordinates are required. The backend accepts duplicate places because
the same place can be meaningful more than once in a schedule.

## Persistence and migrations

SQLAlchemy provides a small SQLite-backed persistence layer. UUIDs identify users, sessions,
trips, and itinerary items. SQLite is the local default; `DATABASE_URL` can select another
SQLAlchemy database later. Schema changes must be represented by Alembic migrations.

```bash
cd backend
uv run alembic upgrade head
```

The current automatic item position is the next value on its day. This is sufficient for the
single-process SQLite MVP; stronger ordering constraints can be introduced if concurrent editing
becomes a product requirement.

## Configuration

Environment access is centralized in `app/core/config.py`. See `.env.example` for supported names.
No API keys are currently assumed. Stable third-party URLs should eventually be named constants in
their related services; keys, deploy-specific URLs, and secrets belong in settings.

`COOKIE_SECURE=false` permits local HTTP development. HTTPS deployments must set it to `true` so
the browser never sends the authentication cookie over an unencrypted connection.

## Development

```bash
cd backend
uv sync --locked
uv run alembic upgrade head
uv run fastapi dev app/main.py
uv run pytest
```

Use the FastAPI CLI for serving the application. Keep tests focused on the primary account, trip,
authorization, and migration paths rather than attempting exhaustive production hardening now.
