"""
Payroll model.

net_salary is always derived: basic + hra - deductions.
We store it explicitly for audit/history rather than computing on every read.
updated_at lets HR know when the last payroll run was.
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.db import Base


class Payroll(Base):
    """Docstring for Payroll."""
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    basic = Column(Float, default=0.0, nullable=False)
    hra = Column(Float, default=0.0, nullable=False)
    deductions = Column(Float, default=0.0, nullable=False)
    net_salary = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="payroll")

