import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class CategoryCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Category name is required")
        if len(stripped) > 50:
            raise ValueError("Category name must be 50 characters or less")
        return stripped


class CategoryUpdate(BaseModel):
    name: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        stripped = v.strip()
        if not stripped:
            raise ValueError("Category name cannot be empty")
        if len(stripped) > 50:
            raise ValueError("Category name must be 50 characters or less")
        return stripped


class CategoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    is_predefined: bool
    created_at: datetime

    model_config = {"from_attributes": True}
