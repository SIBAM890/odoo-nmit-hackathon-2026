"""
Payroll router.

- Employees: read-only view of their own payroll
- Admin: read all, update any employee's salary structure

net_salary is always recomputed on update: basic + hra - deductions.
This prevents data drift from stale computed values.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_employee, require_admin
from app.database.db import get_db
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.models.user import User
from app.schemas.payroll import PayrollOut, PayrollUpdate
from datetime import datetime

router = APIRouter(prefix="/payroll", tags=["payroll"])




@router.get("/me", response_model=PayrollOut)
def my_payroll(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    payroll = db.query(Payroll).filter(Payroll.employee_id == current_employee.id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="No payroll record found")
    return payroll


@router.get("", response_model=List[PayrollOut])
def all_payroll(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    payrolls = db.query(Payroll).all()
    return [p for p in payrolls]


@router.put("/{employee_id}", response_model=PayrollOut)
def update_payroll(
    employee_id: int,
    payload: PayrollUpdate,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    payroll = db.query(Payroll).filter(Payroll.employee_id == employee_id).first()
    if not payroll:
        # Create one if it doesn't exist yet
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        payroll = Payroll(employee_id=employee_id)
        db.add(payroll)

    payroll.basic = payload.basic
    payroll.hra = payload.hra
    payroll.deductions = payload.deductions
    payroll.net_salary = payload.basic + payload.hra - payload.deductions
    payroll.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(payroll)
    return payroll
