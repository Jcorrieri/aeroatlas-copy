import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]


def _get_origins() -> tuple[str, ...]:
    value = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    return tuple(origin.strip() for origin in value.split(",") if origin.strip())


@dataclass(frozen=True)
class Settings:
    cors_origins: tuple[str, ...]
    provider_user_agent: str
    unsplash_api_key: str | None
    cache_path: Path
    http_timeout_seconds: float


@lru_cache
def get_settings() -> Settings:
    load_dotenv(BACKEND_DIR / ".env")
    return Settings(
        cors_origins=_get_origins(),
        provider_user_agent=os.getenv("PROVIDER_USER_AGENT", "aeroatlas/1.0"),
        unsplash_api_key=os.getenv("UNSPLASH_API_KEY") or os.getenv("IMG_KEY"),
        cache_path=Path(os.getenv("CACHE_PATH", BACKEND_DIR / "data_cache")),
        http_timeout_seconds=float(os.getenv("HTTP_TIMEOUT_SECONDS", "10")),
    )
