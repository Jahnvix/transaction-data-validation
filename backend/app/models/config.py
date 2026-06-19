from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


FieldType = Literal["string", "email", "phone", "date", "datetime", "integer", "float"]


class CountryPhoneRule(BaseModel):
    digits: int
    pattern: str


class FieldRule(BaseModel):
    required: bool = True
    type: FieldType
    allowed_values: list[str] = Field(default_factory=list)
    min_value: float | None = None
    formats: list[str] = Field(default_factory=list)


class ValidationConfig(BaseModel):
    required_columns: list[str]
    country_column: str
    phone_column: str
    date_formats: list[str] = Field(default_factory=list)
    datetime_formats: list[str] = Field(default_factory=list)
    phone_rules: dict[str, CountryPhoneRule]
    field_rules: dict[str, FieldRule]
