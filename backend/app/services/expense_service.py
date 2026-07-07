import uuid
from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    PaginatedExpenseResponse,
    ReceiptResponse,
)

PAGE_SIZE = 20

VALID_SORT_FIELDS = {"date", "amount", "created_at", "updated_at"}

SORT_COLUMN_MAP = {
    "date": Expense.date,
    "amount": Expense.amount,
    "created_at": Expense.created_at,
    "updated_at": Expense.updated_at,
}


def _decode_cursor(raw: str | None) -> tuple | None:
    if not raw:
        return None
    try:
        parts = raw.split("_")
        if len(parts) < 2:
            return None
        sort_val = parts[0]
        record_id = parts[-1]
        inner = "_".join(parts[1:-1]) if len(parts) > 2 else None
        if inner is not None:
            return (sort_val, inner, record_id)
        return (sort_val, record_id)
    except (ValueError, IndexError):
        return None


def _encode_cursor(sort_val, record_id) -> str:
    return f"{sort_val}_{record_id}"


async def create_expense(
    db: AsyncSession, user_id: uuid.UUID, body: ExpenseCreate
) -> ExpenseResponse:
    cat = await db.execute(
        select(Category).where(Category.id == body.category_id, Category.user_id == user_id)
    )
    category = cat.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    expense = Expense(
        user_id=user_id,
        category_id=body.category_id,
        amount=body.amount,
        date=body.date or date.today(),
        notes=body.notes,
    )
    db.add(expense)
    await db.flush()

    result = ExpenseResponse.model_validate(expense)
    result.category_name = category.name
    return result


async def get_expenses(
    db: AsyncSession,
    user_id: uuid.UUID,
    cursor: str | None = None,
    category_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    amount_min: float | None = None,
    amount_max: float | None = None,
    sort_by: str = "date",
    sort_order: str = "desc",
) -> PaginatedExpenseResponse:
    query = (
        select(Expense)
        .options(joinedload(Expense.category), joinedload(Expense.receipts))
        .where(Expense.user_id == user_id)
    )

    if category_id:
        query = query.where(Expense.category_id == category_id)
    if date_from:
        query = query.where(Expense.date >= date.fromisoformat(date_from))
    if date_to:
        query = query.where(Expense.date <= date.fromisoformat(date_to))
    if amount_min is not None:
        query = query.where(Expense.amount >= amount_min)
    if amount_max is not None:
        query = query.where(Expense.amount <= amount_max)

    if sort_by not in VALID_SORT_FIELDS:
        sort_by = "date"
    sort_column = SORT_COLUMN_MAP[sort_by]

    if cursor:
        decoded = _decode_cursor(cursor)
        if decoded:
            sort_val_str = decoded[0]
            record_id = decoded[-1]
            if sort_by == "date":
                sort_val_cast = date.fromisoformat(sort_val_str)
            elif sort_by in ("created_at", "updated_at"):
                sort_val_cast = datetime.fromtimestamp(float(sort_val_str), tz=timezone.utc)
            else:
                sort_val_cast = float(sort_val_str)

            if sort_order == "desc":
                query = query.where(
                    tuple_(sort_column, Expense.id) < tuple_(sort_val_cast, record_id)
                )
            else:
                query = query.where(
                    tuple_(sort_column, Expense.id) > tuple_(sort_val_cast, record_id)
                )

    order_fn = sort_column.desc if sort_order == "desc" else sort_column.asc
    query = query.order_by(order_fn(), Expense.id.desc())

    query = query.limit(PAGE_SIZE + 1)

    result = await db.execute(query)
    expenses = result.unique().scalars().all()

    has_more = len(expenses) > PAGE_SIZE
    items = expenses[:PAGE_SIZE]

    expense_responses = []
    for exp in items:
        resp = ExpenseResponse.model_validate(exp)
        resp.category_name = exp.category.name if exp.category else None
        resp.receipts = [ReceiptResponse.model_validate(r) for r in exp.receipts]
        expense_responses.append(resp)

    next_cursor = None
    if has_more and items:
        last = items[-1]
        sort_value = getattr(last, sort_by)
        if sort_by == "date":
            sort_str = sort_value.isoformat()
        elif sort_by in ("created_at", "updated_at"):
            sort_str = str(sort_value.timestamp())
        else:
            sort_str = str(sort_value)
        next_cursor = _encode_cursor(sort_str, str(last.id))

    return PaginatedExpenseResponse(
        items=expense_responses,
        next_cursor=next_cursor,
    )


async def get_expense(db: AsyncSession, user_id: uuid.UUID, expense_id: uuid.UUID) -> ExpenseResponse:
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category), joinedload(Expense.receipts))
        .where(Expense.id == expense_id, Expense.user_id == user_id)
    )
    expense = result.unique().scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    resp = ExpenseResponse.model_validate(expense)
    resp.category_name = expense.category.name if expense.category else None
    resp.receipts = [ReceiptResponse.model_validate(r) for r in expense.receipts]
    return resp


async def update_expense(
    db: AsyncSession, user_id: uuid.UUID, expense_id: uuid.UUID, body: ExpenseUpdate
) -> ExpenseResponse:
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category), joinedload(Expense.receipts))
        .where(Expense.id == expense_id, Expense.user_id == user_id)
    )
    expense = result.unique().scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    if body.category_id is not None:
        cat = await db.execute(
            select(Category).where(Category.id == body.category_id, Category.user_id == user_id)
        )
        if not cat.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        expense.category_id = body.category_id

    if body.amount is not None:
        expense.amount = body.amount
    if body.date is not None:
        expense.date = body.date
    if body.notes is not None:
        expense.notes = body.notes

    db.add(expense)
    await db.flush()

    resp = ExpenseResponse.model_validate(expense)
    resp.category_name = expense.category.name if expense.category else None
    resp.receipts = [ReceiptResponse.model_validate(r) for r in expense.receipts]
    return resp


async def delete_expense(db: AsyncSession, user_id: uuid.UUID, expense_id: uuid.UUID) -> None:
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    await db.delete(expense)
