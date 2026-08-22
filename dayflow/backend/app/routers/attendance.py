"""
Attendance router.

Business rules enforced server-side:
- check-in: only one per day per employee (409 if already checked in)
- check-out: must have a check-in for today (400 if not)
- check-out auto-sets status: ≥4 hours → present, <4 hours → half-day
- Admin can read any employee's records and correct them

Employees can only see their own records (enforced via get_current_employee).
"""
from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_employee, require_admin
from app.database.db import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import AttendanceAdminUpdate, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _enrich_attendance(record: Attendance) -> dict:
    d = {c.name: getattr(record, c.name) for c in record.__table__.columns}
    if record.employee and record.employee.user:
        d["employee_name"] = record.employee.full_name
        d["employee_code"] = record.employee.user.employee_id
    return d


@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    today = date.today()
    existing = (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_employee.id, Attendance.date == today)
        .first()
    )
    if existing and existing.check_in_time:
        raise HTTPException(
            status_code=409,
            detail="Already checked in today. Check out first.",
        )

    now = datetime.utcnow()
    if existing:
        existing.check_in_time = now
        existing.status = AttendanceStatus.present
        db.commit()
        db.refresh(existing)
        return _enrich_attendance(existing)

    record = Attendance(
        employee_id=current_employee.id,
        date=today,
        check_in_time=now,
        status=AttendanceStatus.present,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _enrich_attendance(record)


@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    today = date.today()
    record = (
        db.query(Attendance)
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

    now = datetime.utcnow()
    record.check_out_time = now

    # Auto-compute status based on hours worked
    hours = (now - record.check_in_time).total_seconds() / 3600
    record.status = AttendanceStatus.present if hours >= 4 else AttendanceStatus.half_day

    db.commit()
    db.refresh(record)
    return _enrich_attendance(record)


@router.get("/me", response_model=List[AttendanceOut])
def my_attendance(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_employee.id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return [_enrich_attendance(r) for r in records]


@router.get("", response_model=List[AttendanceOut])
def all_attendance(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    employee_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    """Admin: get all attendance records, optionally filtered."""
    q = db.query(Attendance)
    if employee_id:
        q = q.filter(Attendance.employee_id == employee_id)
    if date_from:
        q = q.filter(Attendance.date >= date_from)
    if date_to:
        q = q.filter(Attendance.date <= date_to)
    records = q.order_by(Attendance.date.desc()).all()
    return [_enrich_attendance(r) for r in records]


@router.get("/{employee_id}", response_model=List[AttendanceOut])
def employee_attendance(
    employee_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return [_enrich_attendance(r) for r in records]


@router.put("/{record_id}", response_model=AttendanceOut)
def admin_update_attendance(
    record_id: int,
    payload: AttendanceAdminUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin correction of attendance records."""
    record = db.query(Attendance).filter(Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return _enrich_attendance(record)
