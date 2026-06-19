from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.settings import get_settings
from app.models.config import ValidationConfig
from app.services.csv_processing import CSVProcessingService
from app.services.file_storage import FileStorageService
from app.services.validation_service import ValidationService


def create_app() -> FastAPI:
    settings = get_settings()
    validation_config = ValidationConfig.model_validate_json(
        settings.validation_config_path.read_text(encoding="utf-8")
    )
    validation_service = ValidationService(validation_config)
    storage_service = FileStorageService(settings.storage_dir)
    processing_service = CSVProcessingService(validation_service, storage_service)

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="CSV validation and processing service for transaction datasets.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.settings = settings
    app.state.validation_config = validation_config
    app.state.processing_service = processing_service

    app.include_router(router)
    return app


app = create_app()
