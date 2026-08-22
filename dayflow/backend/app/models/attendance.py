"""
Attendance model.

Status is set automatically on check-out:
  - hours >= 4  → present
  - hours < 4   → half-day
  - no check-in → absent (set by admin or scheduled job)
Admin can manually override status for corrections.
"""
import enum
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.db import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half-day"
    leave = "leave"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.absent, nullable=False)

    employee = relationship("Employee", back_populates="attendance_records")
