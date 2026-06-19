from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pandas as pd
from pandas.errors import EmptyDataError, ParserError

from app.services.file_storage import FileStorageService
from app.services.validation_service import ValidationOutcome, ValidationService


@dataclass(frozen=True)
class ProcessingJobResult:
    job_id: str
    original_filename: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    chunk_size: int
    chunk_paths: list[Path]
    cleaned_csv_path: Path
    error_csv_path: Path
    chunks_zip_path: Path | None


class CSVProcessingService:
    def __init__(
        self,
        validation_service: ValidationService,
        storage_service: FileStorageService,
    ) -> None:
        self.validation_service = validation_service
        self.storage_service = storage_service

    def process_upload(
        self,
        filename: str,
        file_content: bytes,
        chunk_size: int,
    ) -> ProcessingJobResult:
        safe_filename = Path(filename or "dataset.csv").name
        if Path(safe_filename).suffix.lower() != ".csv":
            raise ValueError("Only CSV files are supported.")

        dataframe = self._read_csv(file_content)
        if dataframe.empty:
            raise ValueError("The uploaded CSV does not contain any data rows.")

        dataframe.columns = [str(column).strip() for column in dataframe.columns]
        if any(not column for column in dataframe.columns):
            raise ValueError("CSV headers cannot be empty.")

        self.validation_service.validate_headers(list(dataframe.columns))

        validation_outcome: ValidationOutcome = self.validation_service.validate_dataframe(
            dataframe.fillna("")
        )
        job_id = uuid4().hex
        job_paths = self.storage_service.create_job_paths(job_id)

        self.storage_service.write_dataframe(
            validation_outcome.valid_frame,
            job_paths.cleaned_csv_path,
        )
        self.storage_service.write_dataframe(
            validation_outcome.error_frame,
            job_paths.error_csv_path,
        )

        chunk_paths = self.storage_service.write_chunks(
            validation_outcome.valid_frame,
            chunk_size,
            job_paths.chunks_dir,
        )
        chunks_zip_path = self.storage_service.create_chunks_archive(
            chunk_paths,
            job_paths.chunks_zip_path,
        )

        return ProcessingJobResult(
            job_id=job_id,
            original_filename=safe_filename,
            total_rows=len(dataframe),
            valid_rows=len(validation_outcome.valid_frame),
            invalid_rows=len(validation_outcome.error_frame),
            chunk_size=chunk_size,
            chunk_paths=chunk_paths,
            cleaned_csv_path=job_paths.cleaned_csv_path,
            error_csv_path=job_paths.error_csv_path,
            chunks_zip_path=chunks_zip_path,
        )

    @staticmethod
    def _read_csv(file_content: bytes) -> pd.DataFrame:
        try:
            return pd.read_csv(
                BytesIO(file_content),
                dtype=str,
                keep_default_na=False,
            )
        except EmptyDataError as exc:
            raise ValueError("The uploaded file is empty.") from exc
        except ParserError as exc:
            raise ValueError("The uploaded file is not a valid CSV.") from exc
