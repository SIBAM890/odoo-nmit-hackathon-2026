"""
Auth schemas — request/response shapes for registration and login.
"""
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.enums import RoleEnum, UserRole


def _validate_password_strength(v: str) -> str:
    """
    Rules: ≥8 chars, at least one uppercase, one lowercase, one digit,
    one special character. Matches the frontend validation display.
    """
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("Password must contain at least one special character")
    return v


class RegisterRequest(BaseModel):
    employee_id: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.employee

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return _validate_password_strength(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    employee_id: str

    @field_validator("role", mode="before")
    @classmethod
    def serialize_role(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()


class UserOut(BaseModel):
    id: int
    employee_id: str
    email: str
    role: str
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    @field_validator("role", mode="before")
    @classmethod
    def serialize_role(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()

    model_config = {"from_attributes": True}


class VerifyEmailResponse(BaseModel):
    message: str
    is_verified: bool
