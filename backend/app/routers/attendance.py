"""
Attendance router.

Business rules:
- check-in: only one per day per employee
- check-out: must have check-in for today
- check-out auto-sets status: ≥4 hours → present, <4 hours → half_day
- Admin can read and correct attendance records
"""
from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_employee, require_admin
from app.database.db import get_db
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatusEnum
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import AttendanceAdminUpdate, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for check_in."""
    now = datetime.utcnow()
    today = now.date()

    existing = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.employee).joinedload(Employee.department),
            joinedload(Attendance.employee).joinedload(Employee.user),
        )
        .filter(Attendance.employee_id == current_employee.id, Attendance.date == today)
        .first()
    )
    if existing:
        if existing.check_out_time:
            raise HTTPException(
                status_code=409,
                detail="Shift already completed for today. Multiple shifts are not currently supported.",
            )
        if existing.check_in_time:
            raise HTTPException(
                status_code=409,
                detail="Already checked in today.",
            )

    record = Attendance(
        employee_id=current_employee.id,
        date=today,
        check_in_time=now,
        status=AttendanceStatusEnum.present,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for check_out."""
    now = datetime.utcnow()
    today = now.date()

    record = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.employee).joinedload(Employee.department),
            joinedload(Attendance.employee).joinedload(Employee.user),
        )
        .filter(Attendance.employee_id == current_employee.id, Attendance.date == today)
        .first()
    )
    if not record or not record.check_in_time:
        raise HTTPException(
            status_code=400,
            detail="No check-in found for today. Please check in first.",
        )
    if record.check_out_time:
        raise HTTPException(status_code=409, detail="Already checked out today.")

    record.check_out_time = now

    # Auto-compute status based on hours worked (treating naive UTC)
    check_in_dt = record.check_in_time.replace(tzinfo=None) if record.check_in_time.tzinfo else record.check_in_time
    hours = (now - check_in_dt).total_seconds() / 3600
    record.status = AttendanceStatusEnum.present if hours >= 4 else AttendanceStatusEnum.half_day

    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=List[AttendanceOut])
def my_attendance(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for my_attendance."""
    records = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.employee).joinedload(Employee.department),
            joinedload(Attendance.employee).joinedload(Employee.user),
        )
        .filter(Attendance.employee_id == current_employee.id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return records


@router.get("", response_model=List[AttendanceOut])
def all_attendance(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    employee_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    """Admin: get all attendance records, optionally filtered."""
    q = db.query(Attendance).options(
        joinedload(Attendance.employee).joinedload(Employee.department),
        joinedload(Attendance.employee).joinedload(Employee.user),
    )
    if employee_id:
        q = q.filter(Attendance.employee_id == employee_id)
    if date_from:
        q = q.filter(Attendance.date >= date_from)
    if date_to:
        q = q.filter(Attendance.date <= date_to)
    records = q.order_by(Attendance.date.desc()).all()
    return records


@router.get("/{employee_id}", response_model=List[AttendanceOut])
def employee_attendance(
    employee_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for employee_attendance."""
    records = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.employee).joinedload(Employee.department),
            joinedload(Attendance.employee).joinedload(Employee.user),
        )
        .filter(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return records


@router.put("/{record_id}", response_model=AttendanceOut)
def admin_update_attendance(
    record_id: int,
    payload: AttendanceAdminUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin correction of attendance records."""
    record = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.employee).joinedload(Employee.department),
            joinedload(Attendance.employee).joinedload(Employee.user),
        )
        .filter(Attendance.id == record_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        status_str = str(data.pop("status")).replace("-", "_").lower()
        if status_str in AttendanceStatusEnum.__members__:
            record.status = AttendanceStatusEnum[status_str]
        elif status_str in [s.value for s in AttendanceStatusEnum]:
            record.status = AttendanceStatusEnum(status_str)

    for field, value in data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record
