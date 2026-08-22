"""
User model — authentication identity.
Satisfies Requirements: Auth (3.1), Dashboard (3.2), System-wide Alerts.

Stores credentials and role only; all profile data lives in employees.
is_verified simulates an email-verification gate.
"""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base
from app.models.enums import RoleEnum, UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SAEnum(RoleEnum, name="role_enum", create_type=True),
        nullable=False,
        default=RoleEnum.employee,
    )
    is_verified = Column(Boolean, default=False, nullable=False)
    verify_token = Column(String(255), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
