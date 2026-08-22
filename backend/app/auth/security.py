"""
JWT token creation and verification + password hashing utilities.

We use python-jose for JWT and passlib[bcrypt] for password hashing.
The secret key and algorithm are loaded from settings so they can be
rotated via environment variables without code changes.
"""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# bcrypt context — future-proofed with schemes list for algorithm upgrades
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Raises JWTError on invalid/expired tokens.
    Caller is responsible for converting to HTTPException.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def generate_verify_token() -> str:
    """Cryptographically random token for email verification simulation."""
    return secrets.token_urlsafe(32)
