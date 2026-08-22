"""
Payroll models: PayrollStructure and PayrollHistory.
Satisfies Requirements: Payroll (3.6), Employee Profile (3.3 - salary structure).
"""
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base


class PayrollStructure(Base):
    __tablename__ = "payroll_structure"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    basic = Column(Numeric(10, 2), nullable=False, default=0.00)
    hra = Column(Numeric(10, 2), nullable=False, default=0.00)
    deductions = Column(Numeric(10, 2), nullable=False, default=0.00)
    net_salary = Column(Numeric(10, 2), nullable=False, default=0.00)
    effective_from = Column(Date, nullable=True, default=date.today)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="payroll_structure")


class PayrollHistory(Base):
    __tablename__ = "payroll_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    basic = Column(Numeric(10, 2), nullable=False)
    hra = Column(Numeric(10, 2), nullable=False)
    deductions = Column(Numeric(10, 2), nullable=False)
    net_salary = Column(Numeric(10, 2), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="payroll_history")
    changer = relationship("User", foreign_keys=[changed_by])


# Backward-compatible alias
Payroll = PayrollStructure
