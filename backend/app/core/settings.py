from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class AppSettings:
    app_name: str
    app_env: str
    cors_origins: list[str]
    storage_dir: Path
    validation_config_path: Path


def _parse_csv_env(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache
def get_settings() -> AppSettings:
    app_name = os.getenv("APP_NAME", "Transaction Validator API")
    app_env = os.getenv("APP_ENV", "development")
    cors_origins = _parse_csv_env(os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000"))
    storage_setting = os.getenv("STORAGE_DIR", "storage/jobs")
    storage_dir = Path(storage_setting)

    if not storage_dir.is_absolute():
        storage_dir = (BASE_DIR / storage_dir).resolve()

    validation_config_path = (BASE_DIR / "app" / "config" / "validation_rules.json").resolve()

    return AppSettings(
        app_name=app_name,
        app_env=app_env,
        cors_origins=cors_origins,
        storage_dir=storage_dir,
        validation_config_path=validation_config_path,
    )
