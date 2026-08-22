"""
Employee model — profile data separate from auth credentials.
Satisfies Requirements: Employee Profile (3.3), Dashboard (3.2).

Split from users so that: (a) HR can edit profile without touching auth,
(b) admin-side employee management is cleanly scoped,
(c) future multi-auth scenarios are easier to handle.
"""
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.db import Base


class Employee(Base):
    """Docstring for Employee."""
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    job_title = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    date_of_joining = Column(Date, nullable=True)
    profile_pic_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="employee")
    attendance_records = relationship("Attendance", back_populates="employee")
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    payroll = relationship("Payroll", back_populates="employee", uselist=False)
    documents = relationship("Document", back_populates="employee")
