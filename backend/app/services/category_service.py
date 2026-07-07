import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.expense import Expense
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

PREDEFINED_CATEGORIES = [
    "Food", "Transport", "Utilities", "Entertainment",
    "Shopping", "Healthcare", "Education", "Rent", "Salary", "Other",
]


async def seed_predefined_categories(db: AsyncSession, user_id: uuid.UUID) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.user_id == user_id, Category.is_predefined)
    )
    existing = {c.name for c in result.scalars().all()}

    created = []
    for name in PREDEFINED_CATEGORIES:
        if name not in existing:
            cat = Category(user_id=user_id, name=name, is_predefined=True)
            db.add(cat)
            created.append(cat)

    if created:
        await db.flush()
    return created


async def list_categories(db: AsyncSession, user_id: uuid.UUID) -> list[CategoryResponse]:
    result = await db.execute(
        select(Category)
        .where(Category.user_id == user_id)
        .order_by(Category.is_predefined.desc(), Category.name)
    )
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


async def create_category(db: AsyncSession, user_id: uuid.UUID, body: CategoryCreate) -> CategoryResponse:
    existing = await db.execute(
        select(Category).where(Category.user_id == user_id, Category.name == body.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category with this name already exists",
        )

    cat = Category(user_id=user_id, name=body.name, is_predefined=False)
    db.add(cat)
    await db.flush()
    return CategoryResponse.model_validate(cat)


async def update_category(
    db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID, body: CategoryUpdate
) -> CategoryResponse:
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if body.name is not None:
        existing = await db.execute(
            select(Category).where(
                Category.user_id == user_id, Category.name == body.name, Category.id != category_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category with this name already exists",
            )
        cat.name = body.name

    db.add(cat)
    await db.flush()
    return CategoryResponse.model_validate(cat)


async def delete_category(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID) -> None:
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    expense_count = await db.execute(
        select(Expense).where(Expense.category_id == category_id).limit(1)
    )
    if expense_count.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete category with existing expenses",
        )

    await db.delete(cat)
