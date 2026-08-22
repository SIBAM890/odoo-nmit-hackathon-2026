"""
LeaveRequest model.
Satisfies Requirements: Leave & Time-Off (3.5), Dashboard (3.2).
"""
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Column, Date, DateTime, Enum as SAEnum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base
from app.models.enums import LeaveStatusEnum, LeaveTypeEnum, LeaveStatus, LeaveType


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="check_valid_date_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(
        SAEnum(LeaveTypeEnum, name="leave_type_enum", create_type=True),
        nullable=False,
    )
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=True)
    status = Column(
        SAEnum(LeaveStatusEnum, name="leave_status_enum", create_type=True),
        default=LeaveStatusEnum.pending,
        nullable=False,
    )
    admin_comment = Column(Text, nullable=True)
    decided_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="leave_requests")
    decider = relationship("User", foreign_keys=[decided_by])

    # Backward compatibility properties for legacy code
    @property
    def reviewed_by(self):
        return self.decided_by

    @reviewed_by.setter
    def reviewed_by(self, value):
        self.decided_by = value

    @property
    def reviewed_at(self):
        return self.decided_at

    @reviewed_at.setter
    def reviewed_at(self, value):
        self.decided_at = value
