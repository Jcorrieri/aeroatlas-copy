import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]


def _get_origins() -> tuple[str, ...]:
    value = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    return tuple(origin.strip() for origin in value.split(",") if origin.strip())


def _get_positive_int(name: str, default: int) -> int:
    value = int(os.getenv(name, str(default)))
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")
    return value


@dataclass(frozen=True)
class Settings:
    cors_origins: tuple[str, ...]
    database_url: str
    session_cookie_name: str
    session_days: int
    cookie_secure: bool


@lru_cache
def get_settings() -> Settings:
    load_dotenv(BACKEND_DIR / ".env")
    return Settings(
        cors_origins=_get_origins(),
        database_url=os.getenv(
            "DATABASE_URL",
            f"sqlite:///{BACKEND_DIR / 'aeroatlas.db'}",
        ),
        session_cookie_name=os.getenv("SESSION_COOKIE_NAME", "aeroatlas_session"),
        session_days=_get_positive_int("SESSION_DAYS", 30),
        cookie_secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
    )
