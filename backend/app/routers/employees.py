"""
Employees router.

Authorization rules:
- GET /employees/me, PUT /employees/me → any authenticated user, but only their own data
- GET /employees, GET /employees/{id}, PUT /employees/{id} → admin only
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_employee, get_current_user, require_admin
from app.database.db import get_db
from app.models.department import Department
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeOut, EmployeeUpdateAdmin, EmployeeUpdateMe

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/me", response_model=EmployeeOut)
def get_my_profile(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Get authenticated employee profile."""
    emp = (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.user))
        .filter(Employee.id == current_employee.id)
        .first()
    )
    return emp


@router.put("/me", response_model=EmployeeOut)
def update_my_profile(
    payload: EmployeeUpdateMe,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Employee self-update phone, address, profile_pic_url."""
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
    """Admin list all employees."""
    employees = (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.user))
        .all()
    )
    return employees


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(
    employee_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin get employee details."""
    emp = (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.user))
        .filter(Employee.id == employee_id)
        .first()
    )
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
    """Admin update employee fields including department."""
    emp = (
        db.query(Employee)
        .options(joinedload(Employee.department), joinedload(Employee.user))
        .filter(Employee.id == employee_id)
        .first()
    )
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    data = payload.model_dump(exclude_unset=True)

    # If department string name was passed
    if "department" in data and data["department"] is not None:
        dept_name = str(data.pop("department")).strip()
        if dept_name:
            dept = db.query(Department).filter(Department.name.ilike(dept_name)).first()
            if not dept:
                dept = Department(name=dept_name)
                db.add(dept)
                db.flush()
            emp.department_id = dept.id
        else:
            emp.department_id = None
    elif "department_id" in data:
        emp.department_id = data.pop("department_id")

    for field, value in data.items():
        setattr(emp, field, value)

    db.commit()
    db.refresh(emp)
    return emp
