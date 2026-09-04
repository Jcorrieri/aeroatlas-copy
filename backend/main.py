"""Compatibility entrypoint for commands that still target the backend root."""

from app.main import app


__all__ = ["app"]
