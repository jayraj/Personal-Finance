from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    preferred_currency: str
    avatar_url: str | None
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    preferred_currency: str | None = None


class DeleteAccountResponse(BaseModel):
    detail: str
