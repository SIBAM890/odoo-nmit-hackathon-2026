from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator


from app.schemas.employee import EmployeeNested

class PayrollOut(BaseModel):
    """Docstring for PayrollOut."""
    id: int
    employee_id: int
    basic: float
    hra: float
    deductions: float
    net_salary: float
    updated_at: datetime
    
    employee: Optional[EmployeeNested] = None

    model_config = {"from_attributes": True}


class PayrollUpdate(BaseModel):
    """Docstring for PayrollUpdate."""
    basic: float
    hra: float
    deductions: float

    @model_validator(mode="after")
    def compute_net(self) -> "PayrollUpdate":
        # Validation: components must be non-negative
        """Docstring for compute_net."""
        if self.basic < 0 or self.hra < 0 or self.deductions < 0:
            raise ValueError("Salary components must be non-negative")
        if self.basic + self.hra - self.deductions < 0:
            raise ValueError("Net salary cannot be negative (deductions exceed basic + hra)")
        return self

    @property
    def net_salary(self) -> float:
        """Docstring for net_salary."""
        return self.basic + self.hra - self.deductions

