from datetime import date
from typing import Optional

from pydantic import BaseModel, model_validator

from app.models.leave_request import LeaveStatus, LeaveType


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self) -> "LeaveCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        if self.start_date < date.today():
            raise ValueError("start_date cannot be in the past")
        return self

from app.schemas.employee import EmployeeNested

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    status: LeaveStatus
    admin_comment: Optional[str] = None
    
    employee: Optional[EmployeeNested] = None

    model_config = {"from_attributes": True}


class LeaveDecision(BaseModel):
    """Admin approve/reject payload."""
    admin_comment: Optional[str] = None
