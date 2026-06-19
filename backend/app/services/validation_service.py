from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation

import pandas as pd

from app.models.config import ValidationConfig


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@dataclass
class ValidationOutcome:
    valid_frame: pd.DataFrame
    error_frame: pd.DataFrame


class ValidationService:
    def __init__(self, config: ValidationConfig) -> None:
        self.config = config
        self._phone_rules = {
            country.casefold(): rule for country, rule in config.phone_rules.items()
        }
        self._phone_patterns = {
            country.casefold(): re.compile(rule.pattern)
            for country, rule in config.phone_rules.items()
        }

    def validate_headers(self, columns: list[str]) -> None:
        duplicate_columns = {column for column in columns if columns.count(column) > 1}
        if duplicate_columns:
            raise ValueError(
                "Duplicate column names found: "
                + ", ".join(sorted(duplicate_columns))
            )

        missing_columns = [
            column for column in self.config.required_columns if column not in columns
        ]
        if missing_columns:
            raise ValueError(
                "Missing required columns: " + ", ".join(missing_columns)
            )

    def validate_dataframe(self, dataframe: pd.DataFrame) -> ValidationOutcome:
        columns = list(dataframe.columns)
        valid_rows: list[dict[str, str]] = []
        error_rows: list[dict[str, str | int]] = []
        seen_signatures: set[tuple[str, ...]] = set()

        for row_number, raw_row in enumerate(
            dataframe.to_dict(orient="records"),
            start=2,
        ):
            original_row = {column: self._stringify(raw_row.get(column)) for column in columns}
            normalized_row = {
                column: original_row[column].strip()
                for column in columns
            }
            row_errors = self._validate_row(normalized_row)

            signature = tuple(normalized_row[column] for column in columns)
            if signature in seen_signatures:
                row_errors.append("duplicate row")
            else:
                seen_signatures.add(signature)

            if row_errors:
                error_row: dict[str, str | int] = dict(original_row)
                error_row["source_row_number"] = row_number
                error_row["validation_errors"] = "; ".join(row_errors)
                error_rows.append(error_row)
            else:
                valid_rows.append(normalized_row)

        valid_frame = pd.DataFrame(valid_rows, columns=columns)
        error_frame = pd.DataFrame(
            error_rows,
            columns=[*columns, "source_row_number", "validation_errors"],
        )
        return ValidationOutcome(valid_frame=valid_frame, error_frame=error_frame)

    def _validate_row(self, row: dict[str, str]) -> list[str]:
        errors: list[str] = []

        if all(not value for value in row.values()):
            return ["row is empty"]

        for field_name, field_rule in self.config.field_rules.items():
            value = row.get(field_name, "")

            if field_rule.required and not value:
                errors.append(f"{field_name}: missing value")
                continue

            if not value:
                continue

            errors.extend(self._validate_field(field_name, value, row))

        return errors

    def _validate_field(
        self,
        field_name: str,
        value: str,
        row: dict[str, str],
    ) -> list[str]:
        rule = self.config.field_rules[field_name]
        errors: list[str] = []

        if rule.allowed_values:
            allowed_values = {item.casefold() for item in rule.allowed_values}
            if value.casefold() not in allowed_values:
                errors.append(
                    f"{field_name}: unsupported value '{value}'"
                )

        if rule.type == "email" and not EMAIL_PATTERN.fullmatch(value):
            errors.append(f"{field_name}: invalid email format")

        if rule.type == "phone":
            country = row.get(self.config.country_column, "").strip().casefold()
            if not country:
                errors.append(f"{self.config.country_column}: missing value")
            elif country not in self._phone_rules:
                errors.append(
                    f"{field_name}: no phone rule configured for '{row.get(self.config.country_column, '')}'"
                )
            else:
                digits_only = re.sub(r"\D", "", value)
                phone_rule = self._phone_rules[country]
                if len(digits_only) != phone_rule.digits:
                    errors.append(
                        f"{field_name}: expected {phone_rule.digits} digits for {row.get(self.config.country_column, '')}"
                    )
                elif not self._phone_patterns[country].fullmatch(digits_only):
                    errors.append(f"{field_name}: invalid phone number format")

        if rule.type == "date":
            formats = rule.formats or self.config.date_formats
            if not self._matches_any_format(value, formats):
                errors.append(f"{field_name}: invalid date format")

        if rule.type == "datetime":
            formats = rule.formats or self.config.datetime_formats
            if not self._matches_any_format(value, formats):
                errors.append(f"{field_name}: invalid datetime format")

        if rule.type == "integer":
            parsed_number = self._parse_decimal(value)
            if parsed_number is None or parsed_number % 1 != 0:
                errors.append(f"{field_name}: invalid integer")
            elif rule.min_value is not None and parsed_number < Decimal(str(rule.min_value)):
                errors.append(f"{field_name}: must be at least {rule.min_value:g}")

        if rule.type == "float":
            parsed_number = self._parse_decimal(value)
            if parsed_number is None:
                errors.append(f"{field_name}: invalid number")
            elif rule.min_value is not None and parsed_number < Decimal(str(rule.min_value)):
                errors.append(f"{field_name}: must be at least {rule.min_value:g}")

        return errors

    @staticmethod
    def _matches_any_format(value: str, formats: list[str]) -> bool:
        for date_format in formats:
            try:
                datetime.strptime(value, date_format)
                return True
            except ValueError:
                continue
        return False

    @staticmethod
    def _parse_decimal(value: str) -> Decimal | None:
        try:
            return Decimal(value)
        except InvalidOperation:
            return None

    @staticmethod
    def _stringify(value: object) -> str:
        if value is None:
            return ""
        if pd.isna(value):
            return ""
        return str(value)
