# AeroAtlas refactor plan

This is a deliberately small planning backlog. The immediate goal is to bring the existing
application to an acceptable, understandable standard before adding features. It is not a plan
to solve every edge case or design the final production architecture.

## Primary goals

1. Restructure the FastAPI backend around a small `core/`, `routers/`, and `services/` layout.
2. Keep credentials and secret-bearing third-party API calls out of the browser.
3. Give backend and frontend code clear responsibilities and obvious locations.

## Working principles

- Keep one Next.js frontend and one FastAPI backend.
- Preserve current behavior where reasonable during structural changes.
- Prefer a few cohesive modules to many small abstractions.
- Add only enough tests to protect the main user flows being changed.
- Defer persistence redesign, exhaustive error handling, and production hardening until needed.
- Do not add new product features during the refactor.

## Phase 1 — Establish a clean backend foundation

### AA-001 — Introduce uv and a Python project

Add `backend/pyproject.toml`, `backend/uv.lock`, and a documented Python version. Declare the
dependencies currently required by the backend and basic development tools.

Done when:

- `uv sync --locked` creates the backend environment from a clean checkout.
- One documented `uv run` command starts FastAPI.
- One documented command runs the backend tests.

### AA-002 — Apply the proposed FastAPI layout

Move the backend into the structure described in `BACKEND.md`. Keep `main.py` focused on creating
the application, configuring middleware, and including routers.

Done when:

- HTTP endpoints live in `routers/<resource>_router.py`.
- Application behavior and provider calls live in `services/<resource>_service.py`.
- Shared configuration and dependencies live in `core/`.
- Imports work consistently through the `app` package.

### AA-003 — Use FastAPI dependency injection for shared resources

Stop passing `Request` into services to access cache, configuration, and credentials. Provide
settings, the HTTP client, cache, and services through small FastAPI dependencies.

Done when:

- Service functions do not depend on FastAPI `Request` objects.
- A shared HTTP client and cache are created and closed through application lifespan.
- Tests can replace external services through dependency overrides.

### AA-004 — Add focused backend tests

Cover the existing destination and itinerary happy paths while moving them. Include tests for
the image response bug and basic provider failure, but do not attempt exhaustive edge coverage.

Done when:

- Tests run without real third-party requests.
- The primary destination and itinerary routes have basic success and failure coverage.

## Phase 2 — Protect credentials and clarify the API boundary

### AA-005 — Centralize configuration

Replace scattered environment reads and hard-coded backend URLs with one backend settings module
and one frontend API configuration module. Add `.env.example` files containing placeholders.

The current backend hardcodes the Nominatim, FlagCDN, Unsplash, and Google Flights URLs, an
Unsplash fallback image URL, the local CORS origin, and a user agent containing a personal email.
Classify these values instead of moving every string into environment variables:

- API keys, allowed origins, and deployment-specific identifiers belong in backend settings.
- Stable provider base URLs belong as named constants in the service that uses that provider.
- Provider timeouts and endpoints need settings only if deployments must override them.
- Fallback images should preferably be local assets, or clearly named service constants.
- Fixed travel data such as `Jacksonville, USA` should become trip/user input or be removed.

API keys are not currently available. The refactor must not invent credentials or use insecure
defaults. Provider-backed features may fail clearly or remain disabled until keys are configured.

Done when:

- Backend secrets are loaded and validated in `core/config.py`.
- Components and hooks do not read environment variables directly.
- Local and deployed API URLs can be changed without editing components.
- Raw URLs and personal identifiers are not scattered through routers or business logic.
- `.env.example` documents required values without implying that real values are present.

### AA-006 — Move third-party data requests to the backend

The frontend currently calls LocationIQ and Geoapify directly from pages, map components, and
utility files. Add simple backend endpoints for autocomplete, geocoding, and nearby-place search,
then update the frontend to call those endpoints.

Done when:

- LocationIQ and Geoapify keys are no longer exposed through `NEXT_PUBLIC_*` variables.
- The browser makes these requests only through the AeroAtlas backend.
- Provider response shapes and basic errors are normalized by backend services.

Cesium may still require a browser token. If retained, document it as public and restrict it by
allowed domain through the provider rather than treating it as a server secret.

### AA-007 — Move Supabase usage behind backend auth endpoints

Login, signup, guest login, and current-user lookup currently call Supabase from UI components.
Expose a small backend auth contract and make the frontend depend on it instead of the Supabase
SDK. Reevaluate the long-term auth provider during this work; do not build a complex custom auth
system solely for the refactor.

Done when:

- Frontend modules no longer import the Supabase client.
- Shared guest credentials are removed from browser code.
- Login, signup, logout, and current-user access go through backend endpoints.
- The Supabase frontend dependency is removed when no imports remain.

### AA-008 — Create one frontend API client

Replace direct `fetch` and axios calls in components with a small typed client under `lib/api/`.
Use the built-in `fetch` API unless axios provides a concrete benefit.

Done when:

- One module owns the backend base URL, request parsing, and common errors.
- Components call resource functions instead of constructing URLs.
- The primary API responses do not use `any`.

## Phase 3 — Make the frontend understandable

### AA-009 — Organize code by responsibility

Keep route files in `app/`, reusable UI primitives in `components/ui/`, and product features in a
small set of clearly named feature folders. Move or remove experimental and copied example code.

Done when:

- Auth, trip, itinerary, and map code each have one obvious location.
- Active route URLs remain unchanged.
- Duplicate headers, navigation, and unused example code are removed after checking usage.

### AA-010 — Reduce the map implementation to one maintainable feature

There are two map implementations, and the active `components/streetmap.tsx` is over 2,000 lines.
Confirm the active version, remove the obsolete one, and split the retained implementation into a
small number of cohesive components and hooks.

Suggested boundaries are map setup, place search, markers/results, and itinerary actions. These
are guides, not a requirement to create a file for every function.

Done when:

- There is one supported map implementation.
- Provider access goes through the frontend API client.
- Map SDK lifecycle, search state, and itinerary actions have distinct owners.

### AA-011 — Simplify itinerary state ownership

Itinerary state is currently synchronized through backend cache data, component state,
`localStorage`, URL values, and global window events. Make backend data authoritative and manage
the frontend copy through one feature hook or provider.

Done when:

- Components do not use custom window events for itinerary updates.
- A mutation updates or reloads the shared itinerary state predictably.
- `localStorage` is used only if explicit draft or offline behavior is retained.

## Phase 4 — Basic project health

### AA-012 — Resolve high and critical npm vulnerabilities

Review `npm audit`, prioritize direct or runtime dependencies, and use the smallest compatible
updates. Avoid a broad framework upgrade unless it is required to remove a serious vulnerability.

The current audit reports 2 critical, 11 high, 4 moderate, and 5 low findings. Start with these
direct dependencies, then audit again instead of pinning each transitive package individually:

- update Next.js within version 15 and align `eslint-config-next` to the same release;
- update axios within version 1 to resolve its own advisories and the `form-data` chain;
- update PostCSS within version 8;
- update or remove the frontend Supabase package while AA-007 is in progress.

Also align React 18 type packages with the installed React 18 runtime. Document a supported Node
LTS version so installs and audits are reproducible.

Done when:

- No known high or critical vulnerability has an available non-breaking fix left unapplied.
- Any accepted remaining vulnerability has a short explanation.
- Build, type checking, and linting still pass after updates.

### AA-013 — Restore useful quality checks

Add working lint, type-check, build, and focused test commands. Align React, Next.js, type, and
ESLint package versions when needed, without turning this into a general dependency upgrade.

Done when:

- `npm run lint`, `npm run typecheck`, and `npm run build` are valid commands.
- Backend and frontend checks are documented.
- Main auth, API client, and itinerary behavior have proportionate tests.

### AA-014 — Remove repository artifacts

Stop tracking Python bytecode, runtime cache databases, and editor-specific files. Classify the
root `git` file and sample JSON before removing them so useful fixtures are not lost.

Done when:

- Development and test runs do not dirty the worktree.
- Retained data files have a clear purpose and location.

## Explicitly deferred

These are not required for the initial refactor unless they block a primary goal:

- a complete database and repository redesign;
- microservices, queues, distributed caching, or event buses;
- comprehensive handling for every provider failure;
- a generated OpenAPI frontend client;
- broad UI redesign or framework migration;
- the planned RAG travel chatbot or other new features.

After AA-001 through AA-013 reach an acceptable baseline, reassess the architecture and choose
the next feature based on actual needs.
