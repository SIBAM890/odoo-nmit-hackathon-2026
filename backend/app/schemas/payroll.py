"""
Payroll schemas.
"""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator

from app.schemas.employee import EmployeeNested


class PayrollOut(BaseModel):
    id: int
    employee_id: int
    basic: float
    hra: float
    deductions: float
    net_salary: float
    effective_from: Optional[date] = None
    updated_at: Optional[datetime] = None
    employee: Optional[EmployeeNested] = None

    @field_validator("basic", "hra", "deductions", "net_salary", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if v is not None:
            return float(v)
        return 0.0

    model_config = {"from_attributes": True}


class PayrollUpdate(BaseModel):
    basic: float
    hra: float
    deductions: float
    effective_from: Optional[date] = None

    @model_validator(mode="after")
    def compute_net(self) -> "PayrollUpdate":
        if self.basic < 0 or self.hra < 0 or self.deductions < 0:
            raise ValueError("Salary components must be non-negative")
        if self.basic + self.hra - self.deductions < 0:
            raise ValueError("Net salary cannot be negative (deductions exceed basic + hra)")
        return self

    @property
    def net_salary(self) -> float:
        return float(self.basic + self.hra - self.deductions)


class PayrollHistoryOut(BaseModel):
    id: int
    employee_id: int
    basic: float
    hra: float
    deductions: float
    net_salary: float
    changed_by: Optional[int] = None
    changed_at: datetime
    created_at: datetime

    @field_validator("basic", "hra", "deductions", "net_salary", mode="before")
    @classmethod
    def convert_decimal(cls, v):
        if v is not None:
            return float(v)
        return 0.0

    model_config = {"from_attributes": True}
