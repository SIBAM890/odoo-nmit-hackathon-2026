"""
LeaveRequest model.

Status state machine: pending → approved | rejected
admin_comment is written by HR when approving/rejecting.
"""
import enum
from datetime import date

from sqlalchemy import Column, Date, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.db import Base


class LeaveType(str, enum.Enum):
    paid = "paid"
    sick = "sick"
    unpaid = "unpaid"


class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=True)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending, nullable=False)
    admin_comment = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="leave_requests")
