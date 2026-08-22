"""
Leave requests router.

State machine: pending → approved | rejected (admin only).
Employees can only create and view their own requests.
Approved/rejected status is reflected immediately — no caching layer.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_employee, require_admin
from app.database.db import get_db
from app.models.employee import Employee
from app.models.leave_request import LeaveRequest, LeaveStatus
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveDecision, LeaveOut

router = APIRouter(prefix="/leaves", tags=["leaves"])


def _enrich_leave(leave: LeaveRequest) -> dict:
    d = {c.name: getattr(leave, c.name) for c in leave.__table__.columns}
    if leave.employee and leave.employee.user:
        d["employee_name"] = leave.employee.full_name
        d["employee_code"] = leave.employee.user.employee_id
    return d


@router.post("", response_model=LeaveOut, status_code=201)
def apply_leave(
    payload: LeaveCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    leave = LeaveRequest(
        employee_id=current_employee.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status=LeaveStatus.pending,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return _enrich_leave(leave)


@router.get("/me", response_model=List[LeaveOut])
def my_leaves(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_employee.id)
        .order_by(LeaveRequest.id.desc())
        .all()
    )
    return [_enrich_leave(l) for l in leaves]


@router.get("", response_model=List[LeaveOut])
def all_leaves(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    leaves = db.query(LeaveRequest).order_by(LeaveRequest.id.desc()).all()
    return [_enrich_leave(l) for l in leaves]


@router.put("/{leave_id}/approve", response_model=LeaveOut)
def approve_leave(
    leave_id: int,
    payload: LeaveDecision,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail=f"Leave is already {leave.status.value}")
    leave.status = LeaveStatus.approved
    leave.admin_comment = payload.admin_comment
    db.commit()
    db.refresh(leave)
    return _enrich_leave(leave)


@router.put("/{leave_id}/reject", response_model=LeaveOut)
def reject_leave(
    leave_id: int,
    payload: LeaveDecision,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail=f"Leave is already {leave.status.value}")
    leave.status = LeaveStatus.rejected
    leave.admin_comment = payload.admin_comment
    db.commit()
    db.refresh(leave)
    return _enrich_leave(leave)
