from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str


class ChunkFileResponse(BaseModel):
    name: str
    url: str


class ArtifactLinksResponse(BaseModel):
    cleaned_csv: str
    error_csv: str
    chunks_zip: str | None = None


class ProcessResponse(BaseModel):
    job_id: str
    original_filename: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    chunk_size: int
    generated_chunks: int
    artifacts: ArtifactLinksResponse
    chunk_files: list[ChunkFileResponse] = Field(default_factory=list)


class SchemaFieldResponse(BaseModel):
    name: str
    type: str
    required: bool
    allowed_values: list[str] = Field(default_factory=list)
    formats: list[str] = Field(default_factory=list)


class SchemaResponse(BaseModel):
    required_columns: list[str]
    supported_countries: list[str]
    date_formats: list[str]
    datetime_formats: list[str]
    fields: list[SchemaFieldResponse]
