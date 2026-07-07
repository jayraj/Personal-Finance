from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.profile import DeleteAccountResponse, ProfileUpdate, UserResponse
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)) -> UserResponse:
    return await profile_service.get_profile(current_user)


@router.put("", response_model=UserResponse)
async def update_profile(
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return await profile_service.update_profile(db, current_user, body)


@router.delete("", response_model=DeleteAccountResponse)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DeleteAccountResponse:
    await profile_service.delete_account(db, current_user)
    return DeleteAccountResponse(detail="Account deleted successfully")
