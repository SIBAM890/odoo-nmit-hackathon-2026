"""
User model — authentication identity.

Stores credentials and role only; all profile data lives in employees.
is_verified simulates an email-verification gate (no real SMTP wired —
a /auth/verify/{token} endpoint lets us demo the state machine).
"""
import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship

from app.database.db import Base


class UserRole(str, enum.Enum):
    """Docstring for UserRole."""
    employee = "employee"
    admin = "admin"


class User(Base):
    """Docstring for User."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.employee)
    is_verified = Column(Boolean, default=False, nullable=False)
    # Simulated verify token — would be emailed in production
    verify_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to employee profile (one-to-one)
    employee = relationship("Employee", back_populates="user", uselist=False)

