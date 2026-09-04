Refer to @BACKEND.md and @ISSUES.md for descriptive working tasks.

NOTE: No current .env or .env-example exists. Assume API keys are not configured yet. 

# Scope

The immediate goal is to bring the existing application to an acceptable, maintainable standard
before extending it with new features. Do not attempt to solve every edge case or design the
final production architecture during this refactor.

Prioritize these outcomes:

1. A clear backend layout using `main.py`, `core/`, `routers/`, and `services/`.
2. Protection of credentials by moving secret-bearing third-party calls behind the backend.
3. Separation of HTTP, application, configuration, and UI responsibilities.

Keep the application as a simple Next.js frontend and FastAPI backend. Avoid microservices,
premature abstractions, unnecessary files, and unrelated feature development. Add proportionate
tests for the primary paths being changed rather than exhaustive edge-case coverage.

# Coding Conventions

- Prefer modular, reusable functions and components.
- Keep lines under 100 characters.
- Keep functions under 90 lines when appropriate, but don't stress this too hard.
- Prefer dependency-free solutions when reasonable; ask before installing dependencies.

# Goals

0. Resolve high and critical NPM warnings
1. Restructure the backend (`backend/`) around `main.py`, `core/`, resource routers, and resource
   services.
   - Keep modules cohesive and avoid overly granular files.
2. Move secret-bearing third-party API calls from the frontend to the backend.
3. Move auth handling away from the frontend Supabase client and reevaluate auth management.
4. Make the frontend easier to navigate and reduce the bloated map implementation.
5. Centralize environment handling, protect credentials, and update dependencies as needed.
6. Apply practical best practices without expanding the refactor beyond its goals.

# Eventual Goal
After the refactor meets sufficient standards, consider a RAG chatbot for learning about travel
destinations and attractions. This is not part of the current refactor.
