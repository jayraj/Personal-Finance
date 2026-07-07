import uuid
from datetime import date, datetime

from pydantic import BaseModel, field_validator


class ExpenseCreate(BaseModel):
    category_id: uuid.UUID
    amount: float
    date: date | None = None
    notes: str | None = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return round(v, 2)


class ExpenseUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    amount: float | None = None
    date: date | None = None
    notes: str | None = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float | None) -> float | None:
        if v is not None:
            if v <= 0:
                raise ValueError("Amount must be positive")
            return round(v, 2)
        return v


class ReceiptResponse(BaseModel):
    id: uuid.UUID
    expense_id: uuid.UUID
    file_key: str
    file_name: str
    mime_type: str
    file_size: int
    created_at: datetime
    url: str | None = None

    model_config = {"from_attributes": True}


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    amount: float
    date: date
    notes: str | None
    created_at: datetime
    updated_at: datetime
    category_name: str | None = None
    receipts: list[ReceiptResponse] = []

    model_config = {"from_attributes": True}


class PaginatedExpenseResponse(BaseModel):
    items: list[ExpenseResponse]
    next_cursor: str | None = None
    total: int | None = None
