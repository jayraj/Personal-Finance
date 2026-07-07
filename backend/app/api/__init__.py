from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(profile_router)


__all__ = ["api_router"]
