from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

import pandas as pd


@dataclass(frozen=True)
class JobPaths:
    job_dir: Path
    cleaned_csv_path: Path
    error_csv_path: Path
    chunks_dir: Path
    chunks_zip_path: Path


class FileStorageService:
    def __init__(self, root_dir: Path) -> None:
        self.root_dir = root_dir
        self.root_dir.mkdir(parents=True, exist_ok=True)

    def create_job_paths(self, job_id: str) -> JobPaths:
        job_dir = self.root_dir / job_id
        chunks_dir = job_dir / "chunks"
        chunks_dir.mkdir(parents=True, exist_ok=True)

        return JobPaths(
            job_dir=job_dir,
            cleaned_csv_path=job_dir / "cleaned.csv",
            error_csv_path=job_dir / "errors.csv",
            chunks_dir=chunks_dir,
            chunks_zip_path=job_dir / "chunks.zip",
        )

    def write_dataframe(self, dataframe: pd.DataFrame, output_path: Path) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        dataframe.to_csv(output_path, index=False)

    def write_chunks(
        self,
        dataframe: pd.DataFrame,
        chunk_size: int,
        chunks_dir: Path,
    ) -> list[Path]:
        if dataframe.empty:
            return []

        chunk_paths: list[Path] = []
        for index, start in enumerate(range(0, len(dataframe), chunk_size), start=1):
            chunk_path = chunks_dir / f"chunk_{index}.csv"
            dataframe.iloc[start : start + chunk_size].to_csv(chunk_path, index=False)
            chunk_paths.append(chunk_path)

        return chunk_paths

    def create_chunks_archive(self, chunk_paths: list[Path], archive_path: Path) -> Path | None:
        if not chunk_paths:
            return None

        with ZipFile(archive_path, "w", compression=ZIP_DEFLATED) as archive:
            for chunk_path in chunk_paths:
                archive.write(chunk_path, arcname=chunk_path.name)

        return archive_path
