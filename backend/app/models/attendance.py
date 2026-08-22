"""
Attendance model.
Satisfies Requirements: Attendance (3.4), Dashboard (3.2).
"""
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum as SAEnum, ForeignKey, Index, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base
from app.models.enums import AttendanceStatusEnum, AttendanceStatus


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
        Index("ix_attendance_employee_date", "employee_id", "date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        SAEnum(AttendanceStatusEnum, name="attendance_status_enum", create_type=True),
        default=AttendanceStatusEnum.absent,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="attendance_records")
