"""
Payroll router.

- Employees: read-only view of their own payroll structure
- Admin: read all, update any employee's salary structure with audit history
"""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_employee, require_admin
from app.database.db import get_db
from app.models.employee import Employee
from app.models.payroll import PayrollStructure, PayrollHistory
from app.models.user import User
from app.schemas.payroll import PayrollOut, PayrollUpdate, PayrollHistoryOut

router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.get("/me", response_model=PayrollOut)
def my_payroll(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for my_payroll."""
    payroll = (
        db.query(PayrollStructure)
        .options(joinedload(PayrollStructure.employee).joinedload(Employee.user))
        .filter(PayrollStructure.employee_id == current_employee.id)
        .first()
    )
    if not payroll:
        raise HTTPException(status_code=404, detail="No payroll record found")
    return payroll


@router.get("", response_model=List[PayrollOut])
def all_payroll(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for all_payroll."""
    payrolls = (
        db.query(PayrollStructure)
        .options(joinedload(PayrollStructure.employee).joinedload(Employee.user))
        .all()
    )
    return [p for p in payrolls]


@router.put("/{employee_id}", response_model=PayrollOut)
def update_payroll(
    employee_id: int,
    payload: PayrollUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for update_payroll."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    net_salary = float(payload.basic) + float(payload.hra) - float(payload.deductions)
    now = datetime.utcnow()

    payroll = db.query(PayrollStructure).filter(PayrollStructure.employee_id == employee_id).first()
    if not payroll:
        payroll = PayrollStructure(
            employee_id=employee_id,
            basic=payload.basic,
            hra=payload.hra,
            deductions=payload.deductions,
            net_salary=net_salary,
            effective_from=payload.effective_from or now.date(),
            updated_at=now,
        )
        db.add(payroll)
    else:
        payroll.basic = payload.basic
        payroll.hra = payload.hra
        payroll.deductions = payload.deductions
        payroll.net_salary = net_salary
        if payload.effective_from:
            payroll.effective_from = payload.effective_from
        payroll.updated_at = now

    # Insert into payroll_history for audit trail
    history = PayrollHistory(
        employee_id=employee_id,
        basic=payload.basic,
        hra=payload.hra,
        deductions=payload.deductions,
        net_salary=net_salary,
        changed_by=_admin.id,
        changed_at=now,
    )
    db.add(history)

    db.commit()
    db.refresh(payroll)
    return payroll


@router.get("/history/{employee_id}", response_model=List[PayrollHistoryOut])
def get_payroll_history(
    employee_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get audit history for employee payroll changes."""
    history_records = (
        db.query(PayrollHistory)
        .filter(PayrollHistory.employee_id == employee_id)
        .order_by(PayrollHistory.changed_at.desc())
        .all()
    )
    return history_records
