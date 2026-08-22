"""
FastAPI dependency injection for authentication and authorization.

Design decisions:
- get_current_user: extracts JWT from Bearer token, returns User ORM object.
  Any route that Depends on this is protected — no token = 401.
- require_admin: wraps get_current_user and adds role check.
  Admin-only endpoints Depend on this — wrong role = 403.
- get_current_employee: returns the Employee profile linked to current user.
  All employee-scoped data routes use this, so they can only ever
  access the authenticated user's own data.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.security import decode_token
from app.database.db import get_db
from app.models.employee import Employee
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Docstring for get_current_user."""
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Raises 403 if the authenticated user is not an admin.
    Use as a FastAPI dependency on admin-only routes.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def get_current_employee(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Employee:
    """
    Returns the Employee profile for the authenticated user.
    This dependency guarantees the route can only touch its own data.
    """
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found",
        )
    return employee

