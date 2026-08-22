from datetime import date
from typing import Optional

from pydantic import BaseModel


class EmployeeOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    date_of_joining: Optional[date] = None
    profile_pic_url: Optional[str] = None
    # Flatten user fields for convenience
    email: Optional[str] = None
    employee_id: Optional[str] = None
    role: Optional[str] = None
    is_verified: Optional[bool] = None

    model_config = {"from_attributes": True}


class EmployeeUpdateMe(BaseModel):
    """Fields an employee can self-edit."""
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_pic_url: Optional[str] = None


class EmployeeUpdateAdmin(BaseModel):
    """All fields an admin/HR can edit."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    date_of_joining: Optional[date] = None
    profile_pic_url: Optional[str] = None
