# Proposed FastAPI backend structure

## Goal

Restructure the current backend into a small modular FastAPI application. The purpose is to make
the code easy to find, test, and extend—not to create a perfect production architecture or a
collection of microservices.

The basic flow is:

```text
request -> router -> service -> external provider or current storage
```

- `main.py` creates the application and includes routes.
- `routers/` handles HTTP input and output.
- `services/` contains application behavior and third-party calls.
- `core/` owns shared configuration, lifespan resources, and dependencies.

This is based on FastAPI's
[larger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/) and
[dependency injection](https://fastapi.tiangolo.com/tutorial/dependencies/) guidance.

## Initial structure

```text
backend/
├── pyproject.toml
├── uv.lock
├── .env.example
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── lifecycle.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth_router.py
│   │   ├── destinations_router.py
│   │   ├── itineraries_router.py
│   │   └── places_router.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── destination_service.py
│   │   ├── itinerary_service.py
│   │   └── places_service.py
│   └── schemas.py
└── tests/
    ├── conftest.py
    ├── test_destinations.py
    └── test_itineraries.py
```

Start with this structure and add files only when real behavior requires them:

- Keep schemas together in `schemas.py` until that file becomes difficult to navigate.
- Keep external provider helpers in their related service at first.
- Do not add repository, model, security, or error modules before their responsibilities exist.
- Split a service only when it owns clearly separate behavior or becomes unwieldy.

If durable users, trips, and itinerary storage are introduced later, add `models.py` and a small
persistence module then. Choosing a database is not required for the layout refactor.

## File responsibilities

### `app/main.py`

The entrypoint should only:

- create the `FastAPI` application;
- attach the lifespan function and middleware;
- include resource routers;
- define basic application metadata.

It should not contain request models, itinerary operations, cache key construction, or provider
requests.

```python
from fastapi import FastAPI

from app.core.lifecycle import lifespan
from app.routers import api_router


app = FastAPI(title="AeroAtlas API", lifespan=lifespan)
app.include_router(api_router, prefix="/api")
```

An application factory can be added if tests or multiple configurations benefit from it. It is
not necessary merely to satisfy a pattern.

### `app/routers/`

Each router represents a user-facing API resource. It validates input, requests a service through
`Depends`, calls that service, and returns a declared response.

```python
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.dependencies import get_itinerary_service
from app.services.itinerary_service import ItineraryService


router = APIRouter(prefix="/itineraries", tags=["itineraries"])


@router.get("/{trip_id}")
async def get_itinerary(
    trip_id: str,
    service: Annotated[ItineraryService, Depends(get_itinerary_service)],
):
    return await service.get_itinerary(trip_id)
```

Routers should not know how third-party providers or storage work. Keep existing endpoint paths
during the first move if changing them would unnecessarily combine restructuring with a frontend
migration.

### `app/services/`

Services contain the behavior currently mixed into routes and components:

- `destination_service.py`: destination information, descriptions, flags, and images;
- `itinerary_service.py`: retrieve, add, and remove itinerary items;
- `places_service.py`: autocomplete, geocoding, and nearby places;
- `auth_service.py`: the backend-facing auth operations used by the frontend.

A service may contain small private provider helpers. If provider logic later dominates a file,
move it into a separate provider module at that point.

Services should use ordinary Python inputs and return typed values. They should not accept a
FastAPI `Request` simply to access application state, and they should not raise `HTTPException`
for internal control flow.

### `app/core/`

Core is limited to code shared across several resources:

- `config.py` loads and validates environment settings;
- `lifecycle.py` creates and closes the shared HTTP client and cache;
- `dependencies.py` exposes settings, resources, and service instances to routers.

Do not use `core/` as a general dumping ground. Resource-specific behavior stays in its service.
Configuration should contain values that vary by environment, not every constant in the codebase.

### `app/schemas.py`

Pydantic models define the small public API contract. Use separate input models only when
operations need different fields. In particular, deleting an itinerary item should not require
the full model used to create one.

## Dependency injection

Use FastAPI dependencies where they provide a clear benefit:

- backend settings;
- one lifecycle-managed `httpx.AsyncClient`;
- the current cache or later database session;
- the current authenticated user when backend auth is added;
- service construction from those shared resources.

Use normal function calls for pure helpers. Dependency injection is not a reason to introduce an
interface or factory for every class.

The lifecycle function should own long-lived resources:

```text
startup
  -> create shared HTTP client and cache
  -> serve requests through injected services
shutdown
  -> close shared HTTP client and cache
```

Tests can replace dependency functions with fake providers and storage, keeping network calls out
of the test suite.

## API boundary

The first migration does not need a complete API redesign. Keep the resource surface small:

| Area | Operations |
| --- | --- |
| Auth | signup, login, logout, current user |
| Destinations | destination details |
| Itineraries | get, add item, remove item |
| Places | autocomplete/geocode, nearby search |

New or changed routes should use consistent plural names and declared request/response schemas.
Versioning under `/api/v1` can be introduced when contracts are expected to coexist. If the old
frontend and new frontend are migrated together, a temporary compatibility layer is unnecessary.

## Credentials and providers

Secret-bearing provider requests belong in backend services. This includes LocationIQ, Geoapify,
Unsplash, and any server-side Supabase or replacement auth integration.

The frontend should call AeroAtlas endpoints and should not receive provider secrets. A browser
map SDK token is an exception only when the provider requires it; treat that token as public and
apply domain and usage restrictions at the provider.

Backend environment access should be centralized in `core/config.py`. A checked-in
`.env.example` documents names without real values. Components, routers, and services receive
configuration rather than calling `os.getenv()` or reading scattered environment variables.

No API keys are currently available. Startup should not silently substitute placeholder keys.
Until credentials are supplied, either disable the affected provider-backed feature or return a
clear unavailable response. Tests should inject fake settings and mocked provider responses.

### Where hardcoded values belong

Not every URL should be an environment variable. Use the narrowest appropriate owner:

| Value | Recommended owner |
| --- | --- |
| API keys and auth secrets | Environment-backed `core/config.py` settings |
| Allowed frontend origins | Environment-backed `core/config.py` setting |
| Provider user-agent identity | Environment-backed setting |
| Stable provider base URL | Named constant in the related service |
| Timeout or provider URL requiring deployment overrides | Optional backend setting |
| Fallback image | Local static asset or named destination-service constant |
| User origin, destination, dates, and preferences | Request or stored trip data |

For example, `destination_service.py` can own named constants for the stable Nominatim, FlagCDN,
and Unsplash endpoints. The service receives the Unsplash key and user-agent value from settings.
This keeps secrets configurable without turning ordinary implementation details into deployment
configuration.

The current backend values to address are:

- the Nominatim reverse-geocoding endpoint in `backend/destination.py`;
- the FlagCDN image URL template in `backend/destination.py`;
- the Unsplash search endpoint and long fallback image URL in `backend/destination.py`;
- the Google Flights URL and fixed `Jacksonville, USA` departure in `backend/main.py`;
- the local CORS origin and personal-email user agent in `backend/config.py`.

The Google Flights base URL may be a service constant, but its departure and other trip values
must come from application data. URL query parameters should be built with a URL/query utility
rather than string interpolation so spaces and special characters are encoded correctly.

## uv workflow

The backend becomes a uv project following the
[uv project guide](https://docs.astral.sh/uv/guides/projects/):

```bash
cd backend
uv sync --locked
uv run fastapi dev app/main.py
uv run pytest
```

Commit `uv.lock`. Add linting or type checking once selected, but do not introduce a large tool
stack as a prerequisite for moving the code.

## Implementation order

1. Add the uv project and `app/` package.
2. Add settings, lifecycle, and shared dependencies.
3. Move current destination routes and behavior without changing their contract.
4. Move current itinerary routes and behavior without redesigning persistence.
5. Add focused tests around the moved behavior.
6. Add backend places endpoints and migrate direct frontend provider requests.
7. Add the backend auth boundary and remove frontend Supabase usage.
8. Remove obsolete compatibility code after frontend consumers have moved.

## Not part of this initial refactor

- Microservices, queues, event buses, or distributed caching.
- A generic repository or interface for every component.
- A complete persistence redesign unless current storage blocks required auth behavior.
- Exhaustive provider retries and edge-case handling.
- OpenAPI client generation.
- The planned RAG chatbot or other new product features.

The stopping point is an application with a recognizable layout, protected credentials, clear
frontend/backend boundaries, and enough tests to refactor safely. Further hardening should be
driven by the features and deployment needs that follow.
