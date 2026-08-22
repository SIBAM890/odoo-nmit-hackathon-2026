"""
Auth schemas — request/response shapes for registration and login.

Password strength is validated here (not in the model) so the rule is
enforced on every write path with a clear error message.
"""
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole


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
    """Docstring for RegisterRequest."""
    employee_id: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.employee

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        """Docstring for strong_password."""
        return _validate_password_strength(v)


class LoginRequest(BaseModel):
    """Docstring for LoginRequest."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Docstring for TokenResponse."""
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    employee_id: str


class UserOut(BaseModel):
    """Docstring for UserOut."""
    id: int
    employee_id: str
    email: str
    role: UserRole
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class VerifyEmailResponse(BaseModel):
    """Docstring for VerifyEmailResponse."""
    message: str
    is_verified: bool

