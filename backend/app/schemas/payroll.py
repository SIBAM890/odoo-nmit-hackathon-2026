from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class PayrollOut(BaseModel):
    id: int
    employee_id: int
    basic: float
    hra: float
    deductions: float
    net_salary: float
    updated_at: datetime
    # Enriched for admin list
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    model_config = {"from_attributes": True}


class PayrollUpdate(BaseModel):
    basic: float
    hra: float
    deductions: float

    @model_validator(mode="after")
    def compute_net(self) -> "PayrollUpdate":
        # Validation: components must be non-negative
        if self.basic < 0 or self.hra < 0 or self.deductions < 0:
            raise ValueError("Salary components must be non-negative")
        return self

    @property
    def net_salary(self) -> float:
        return self.basic + self.hra - self.deductions
