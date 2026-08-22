"""
LeaveRequest model.

Status state machine: pending → approved | rejected
admin_comment is written by HR when approving/rejecting.
"""
import enum
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.db import Base


class LeaveType(str, enum.Enum):
    """Docstring for LeaveType."""
    paid = "paid"
    sick = "sick"
    unpaid = "unpaid"


class LeaveStatus(str, enum.Enum):
    """Docstring for LeaveStatus."""
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LeaveRequest(Base):
    """Docstring for LeaveRequest."""
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=True)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending, nullable=False)
    admin_comment = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="leave_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
