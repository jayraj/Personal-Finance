from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.profile import ProfileUpdate, UserResponse


async def get_profile(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


async def update_profile(db: AsyncSession, user: User, body: ProfileUpdate) -> UserResponse:
    if body.display_name is not None:
        user.display_name = body.display_name
    if body.preferred_currency is not None:
        user.preferred_currency = body.preferred_currency
    db.add(user)
    await db.flush()
    return UserResponse.model_validate(user)


async def delete_account(db: AsyncSession, user: User) -> None:
    await db.delete(user)
