"""
Employees router.

Authorization rules enforced here (not in UI):
- GET /employees/me, PUT /employees/me → any authenticated user, but only their own data
- GET /employees, GET /employees/{id}, PUT /employees/{id} → admin only

Employees can only edit: phone, address, profile_pic_url.
All other fields (job_title, department, etc.) are admin-only writes.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_employee, get_current_user, require_admin
from app.database.db import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeOut, EmployeeUpdateAdmin, EmployeeUpdateMe

router = APIRouter(prefix="/employees", tags=["employees"])




@router.get("/me", response_model=EmployeeOut)
def get_my_profile(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for get_my_profile."""
    return current_employee


@router.put("/me", response_model=EmployeeOut)
def update_my_profile(
    payload: EmployeeUpdateMe,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Docstring for update_my_profile."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_employee, field, value)
    db.commit()
    db.refresh(current_employee)
    return current_employee


@router.get("", response_model=List[EmployeeOut])
def list_employees(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for list_employees."""
    employees = db.query(Employee).all()
    return [e for e in employees]


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(
    employee_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for get_employee."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdateAdmin,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Docstring for update_employee."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return emp

