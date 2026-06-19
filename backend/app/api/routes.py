from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse

from app.models.responses import (
    ArtifactLinksResponse,
    ChunkFileResponse,
    HealthResponse,
    ProcessResponse,
    SchemaFieldResponse,
    SchemaResponse,
)
from app.services.csv_processing import CSVProcessingService


router = APIRouter(prefix="/api/v1", tags=["transaction-validator"])


def _get_processing_service(request: Request) -> CSVProcessingService:
    return request.app.state.processing_service


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/schema", response_model=SchemaResponse)
async def get_schema(request: Request) -> SchemaResponse:
    validation_config = request.app.state.validation_config

    fields = [
        SchemaFieldResponse(
            name=field_name,
            type=field_rule.type,
            required=field_rule.required,
            allowed_values=field_rule.allowed_values,
            formats=field_rule.formats,
        )
        for field_name, field_rule in validation_config.field_rules.items()
    ]

    return SchemaResponse(
        required_columns=validation_config.required_columns,
        supported_countries=sorted(validation_config.phone_rules.keys()),
        date_formats=validation_config.date_formats,
        datetime_formats=validation_config.datetime_formats,
        fields=fields,
    )


@router.post("/jobs/process", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def process_csv(
    request: Request,
    file: UploadFile = File(...),
    chunk_size: int = Form(..., gt=0),
) -> ProcessResponse:
    processing_service = _get_processing_service(request)
    file_content = await file.read()

    try:
        result = processing_service.process_upload(
            filename=file.filename or "dataset.csv",
            file_content=file_content,
            chunk_size=chunk_size,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    cleaned_url = str(
        request.url_for("download_artifact", job_id=result.job_id, artifact="cleaned")
    )
    error_url = str(
        request.url_for("download_artifact", job_id=result.job_id, artifact="errors")
    )
    chunks_zip_url = (
        str(request.url_for("download_artifact", job_id=result.job_id, artifact="chunks"))
        if result.chunks_zip_path
        else None
    )

    chunk_files = [
        ChunkFileResponse(
            name=chunk_path.name,
            url=str(
                request.url_for(
                    "download_chunk_file",
                    job_id=result.job_id,
                    filename=chunk_path.name,
                )
            ),
        )
        for chunk_path in result.chunk_paths
    ]

    return ProcessResponse(
        job_id=result.job_id,
        original_filename=result.original_filename,
        total_rows=result.total_rows,
        valid_rows=result.valid_rows,
        invalid_rows=result.invalid_rows,
        chunk_size=result.chunk_size,
        generated_chunks=len(result.chunk_paths),
        artifacts=ArtifactLinksResponse(
            cleaned_csv=cleaned_url,
            error_csv=error_url,
            chunks_zip=chunks_zip_url,
        ),
        chunk_files=chunk_files,
    )


@router.get("/jobs/{job_id}/artifacts/{artifact}", name="download_artifact")
async def download_artifact(job_id: str, artifact: str, request: Request) -> FileResponse:
    storage_dir: Path = request.app.state.settings.storage_dir
    job_dir = storage_dir / job_id

    artifact_map = {
        "cleaned": job_dir / "cleaned.csv",
        "errors": job_dir / "errors.csv",
        "chunks": job_dir / "chunks.zip",
    }

    artifact_path = artifact_map.get(artifact)
    if artifact_path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found.")

    if not artifact_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not available.")

    media_type = "application/zip" if artifact == "chunks" else "text/csv"
    return FileResponse(path=artifact_path, filename=artifact_path.name, media_type=media_type)


@router.get("/jobs/{job_id}/artifacts/chunks/{filename}", name="download_chunk_file")
async def download_chunk_file(job_id: str, filename: str, request: Request) -> FileResponse:
    storage_dir: Path = request.app.state.settings.storage_dir
    chunk_path = storage_dir / job_id / "chunks" / filename

    if not chunk_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chunk file not found.")

    return FileResponse(path=chunk_path, filename=chunk_path.name, media_type="text/csv")
