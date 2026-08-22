from datetime import date
from typing import Optional

from pydantic import BaseModel


class UserNested(BaseModel):
    """Docstring for UserNested."""
    email: str
    employee_id: str
    role: str
    is_verified: bool

    model_config = {"from_attributes": True}


class EmployeeNested(BaseModel):
    """Nested employee schema for relations."""
    id: int
    full_name: str
    department: Optional[str] = None
    job_title: Optional[str] = None
    profile_pic_url: Optional[str] = None
    user: Optional[UserNested] = None

    model_config = {"from_attributes": True}

class EmployeeOut(BaseModel):
    """Docstring for EmployeeOut."""
    id: int
    user_id: int
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    date_of_joining: Optional[date] = None
    profile_pic_url: Optional[str] = None
    user: Optional[UserNested] = None

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

