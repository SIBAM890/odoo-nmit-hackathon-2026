from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.attendance import AttendanceStatus


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: AttendanceStatus
    # Enriched fields for admin views
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    model_config = {"from_attributes": True}


class AttendanceAdminUpdate(BaseModel):
    """Admin can manually correct attendance records."""
    status: Optional[AttendanceStatus] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
