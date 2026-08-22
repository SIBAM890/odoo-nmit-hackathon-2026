"""
Enumerations for Dayflow HRMS database models.
Uses native PostgreSQL ENUM types.
"""
import enum


class RoleEnum(str, enum.Enum):
    employee = "employee"
    admin = "admin"


class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    leave = "leave"


class LeaveTypeEnum(str, enum.Enum):
    paid = "paid"
    sick = "sick"
    unpaid = "unpaid"


class LeaveStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


# Backward-compatible aliases
UserRole = RoleEnum
AttendanceStatus = AttendanceStatusEnum
LeaveType = LeaveTypeEnum
LeaveStatus = LeaveStatusEnum
