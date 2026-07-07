import uuid

from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.s3 import generate_presigned_url, get_s3_client
from app.models.receipt import Receipt
from app.models.user import User
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    PaginatedExpenseResponse,
)
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    body: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    return await expense_service.create_expense(db, current_user.id, body)


@router.get("", response_model=PaginatedExpenseResponse)
async def get_expenses(
    cursor: str | None = Query(None),
    category_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedExpenseResponse:
    return await expense_service.get_expenses(
        db, current_user.id, cursor, category_id, date_from, date_to,
        amount_min, amount_max, sort_by, sort_order,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    resp = await expense_service.get_expense(db, current_user.id, expense_id)
    for r in resp.receipts:
        r.url = generate_presigned_url(r.file_key)
    return resp


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: uuid.UUID,
    body: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExpenseResponse:
    return await expense_service.update_expense(db, current_user.id, expense_id, body)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await expense_service.delete_expense(db, current_user.id, expense_id)


@router.post("/{expense_id}/receipts", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_receipt(
    expense_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    await expense_service.get_expense(db, current_user.id, expense_id)

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and PDF files are supported",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be under 5MB",
        )

    file_key = f"receipts/{expense_id}/{uuid.uuid4()}-{file.filename}"
    s3 = get_s3_client()
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=file_key,
        Body=contents,
        ContentType=file.content_type,
    )

    receipt = Receipt(
        expense_id=expense_id,
        file_key=file_key,
        file_name=file.filename or "receipt",
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(contents),
    )
    db.add(receipt)
    await db.flush()

    return {
        "id": str(receipt.id),
        "file_name": receipt.file_name,
        "mime_type": receipt.mime_type,
        "file_size": receipt.file_size,
        "url": generate_presigned_url(file_key),
    }


@router.delete("/{expense_id}/receipts/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_receipt(
    expense_id: uuid.UUID,
    receipt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await expense_service.get_expense(db, current_user.id, expense_id)

    result = await db.execute(
        select(Receipt).where(Receipt.id == receipt_id, Receipt.expense_id == expense_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")

    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=settings.S3_BUCKET, Key=receipt.file_key)
    except Exception:
        pass

    await db.delete(receipt)
