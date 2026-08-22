"""
Leave schemas.
"""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator

from app.models.enums import LeaveStatusEnum, LeaveTypeEnum, LeaveStatus, LeaveType
from app.schemas.employee import EmployeeNested


class LeaveCreate(BaseModel):
    leave_type: LeaveTypeEnum
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


class LeaveOut(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    status: str
    admin_comment: Optional[str] = None
    decided_by: Optional[int] = None
    decided_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    employee: Optional[EmployeeNested] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    @field_validator("leave_type", mode="before")
    @classmethod
    def serialize_leave_type(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()

    @field_validator("status", mode="before")
    @classmethod
    def serialize_status(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()

    model_config = {"from_attributes": True}


class LeaveDecision(BaseModel):
    """Admin approve/reject payload."""
    admin_comment: Optional[str] = None
