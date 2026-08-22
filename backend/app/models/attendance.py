"""
Attendance model.
Satisfies Requirements: Attendance (3.4), Dashboard (3.2).

Status is set automatically on check-out:
  - hours >= 4  → present
  - hours < 4   → half-day
  - no check-in → absent (set by admin or scheduled job)
Admin can manually override status for corrections.
"""
import enum
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.db import Base


class AttendanceStatus(str, enum.Enum):
    """Docstring for AttendanceStatus."""
    present = "present"
    absent = "absent"
    half_day = "half-day"
    leave = "leave"


class Attendance(Base):
    """Docstring for Attendance."""
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.absent, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="attendance_records")

