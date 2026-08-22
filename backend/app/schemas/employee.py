"""
Employee schemas.
"""
from datetime import date
from typing import Optional

from pydantic import BaseModel, field_validator


class UserNested(BaseModel):
    id: Optional[int] = None
    email: str
    employee_id: str
    role: str
    is_verified: bool

    @field_validator("role", mode="before")
    @classmethod
    def serialize_role(cls, v):
        if hasattr(v, "value"):
            return str(v.value).lower()
        return str(v).lower()

    model_config = {"from_attributes": True}


class EmployeeNested(BaseModel):
    """Nested employee schema for relations."""
    id: int
    full_name: str
    department: Optional[str] = None
    job_title: Optional[str] = None
    profile_pic_url: Optional[str] = None
    user: Optional[UserNested] = None

    @field_validator("department", mode="before")
    @classmethod
    def get_department_str(cls, v):
        if hasattr(v, "name"):
            return v.name
        return v

    model_config = {"from_attributes": True}


class EmployeeOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    department_id: Optional[int] = None
    date_of_joining: Optional[date] = None
    profile_pic_url: Optional[str] = None
    user: Optional[UserNested] = None

    @field_validator("department", mode="before")
    @classmethod
    def get_department_str(cls, v):
        if hasattr(v, "name"):
            return v.name
        return v

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
    department_id: Optional[int] = None
    date_of_joining: Optional[date] = None
    profile_pic_url: Optional[str] = None
