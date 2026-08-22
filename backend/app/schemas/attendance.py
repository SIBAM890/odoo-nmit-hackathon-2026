"""
Attendance schemas.
"""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator

from app.models.enums import AttendanceStatusEnum, AttendanceStatus
from app.schemas.employee import EmployeeNested


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: str
    created_at: Optional[datetime] = None
    employee: Optional[EmployeeNested] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    @field_validator("status", mode="before")
    @classmethod
    def serialize_status(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()

    model_config = {"from_attributes": True}


class AttendanceAdminUpdate(BaseModel):
    """Admin can manually correct attendance records."""
    status: Optional[str] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        if v is not None:
            if hasattr(v, "value"):
                v = v.value
            return str(v).replace("-", "_").lower()
        return v
