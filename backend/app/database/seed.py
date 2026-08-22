"""
Database seed script — creates initial schema and rich demo data for PostgreSQL.

Credentials:
  admin@dayflow.io  / Admin@123  (HR Admin)
  alice@dayflow.io  / Alice@123  (Verified Software Engineer)
  bob@dayflow.io    / Bob@123    (Unverified Product Designer)

Run: python -m app.database.seed
"""
import os
import random
import sys
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.auth.security import hash_password
from app.database.db import SessionLocal, engine
from app.models import (
    Base,
    Department,
    User,
    Employee,
    Attendance,
    LeaveRequest,
    PayrollStructure,
    PayrollHistory,
    RoleEnum,
    AttendanceStatusEnum,
    LeaveTypeEnum,
    LeaveStatusEnum,
)


def seed():
    """Drop and recreate all tables, then seed initial data."""
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)

    print("Creating all tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding database with departments, users, profiles, attendance, leaves, and payroll...")

        # ── 1. Departments ─────────────────────────────────────────────────────
        dept_hr = Department(name="Human Resources")
        dept_eng = Department(name="Engineering")
        dept_design = Department(name="Product & Design")
        dept_sales = Department(name="Sales")
        dept_finance = Department(name="Finance")

        db.add_all([dept_hr, dept_eng, dept_design, dept_sales, dept_finance])
        db.flush()

        # ── 2. Users ───────────────────────────────────────────────────────────
        admin_user = User(
            employee_id="ADM001",
            email="admin@dayflow.io",
            password_hash=hash_password("Admin@123"),
            role=RoleEnum.admin,
            is_verified=True,
            last_login_at=datetime.utcnow(),
        )
        alice_user = User(
            employee_id="EMP001",
            email="alice@dayflow.io",
            password_hash=hash_password("Alice@123"),
            role=RoleEnum.employee,
            is_verified=True,
            last_login_at=datetime.utcnow() - timedelta(hours=2),
        )
        bob_user = User(
            employee_id="EMP002",
            email="bob@dayflow.io",
            password_hash=hash_password("Bob@123"),
            role=RoleEnum.employee,
            is_verified=False,  # Bob demos the unverified state
            verify_token="mock_verify_token_bob_123",
        )
        db.add_all([admin_user, alice_user, bob_user])
        db.flush()

        # ── 3. Employee profiles ───────────────────────────────────────────────
        admin_emp = Employee(
            user_id=admin_user.id,
            full_name="Admin HR",
            phone="+91-9000000001",
            address="NMIT Campus, Bangalore - 560064",
            department_id=dept_hr.id,
            job_title="HR Manager",
            date_of_joining=date(2022, 1, 15),
        )
        alice_emp = Employee(
            user_id=alice_user.id,
            full_name="Alice Johnson",
            phone="+91-9876543210",
            address="12, MG Road, Bengaluru - 560001",
            department_id=dept_eng.id,
            job_title="Senior Software Engineer",
            date_of_joining=date(2023, 6, 1),
        )
        bob_emp = Employee(
            user_id=bob_user.id,
            full_name="Bob Martinez",
            phone="+91-9123456789",
            address="45, Koramangala, Bengaluru - 560034",
            department_id=dept_design.id,
            job_title="Product Designer",
            date_of_joining=date(2024, 1, 10),
        )
        db.add_all([admin_emp, alice_emp, bob_emp])
        db.flush()

        # ── 4. Attendance (3-week weekday history for Alice & Bob) ──────────────
        today = date.today()
        attendance_records = []

        # Track unique (employee_id, date) pairs to guarantee constraint satisfaction
        for emp, emp_name in [(alice_emp, "Alice"), (bob_emp, "Bob")]:
            for days_ago in range(1, 22):  # 21 days past
                d = today - timedelta(days=days_ago)
                if d.weekday() >= 5:  # Skip Saturday & Sunday
                    continue

                roll = random.random()
                if roll < 0.08:  # 8% absent
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        status=AttendanceStatusEnum.absent,
                    )
                elif roll < 0.16:  # 8% half-day
                    check_in = datetime.combine(d, datetime.strptime("09:30", "%H:%M").time())
                    check_out = datetime.combine(d, datetime.strptime("13:30", "%H:%M").time())
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        status=AttendanceStatusEnum.half_day,
                    )
                else:  # Present
                    hour_in = random.choice([8, 9])
                    min_in = random.choice([0, 15, 30, 45])
                    hour_out = random.choice([17, 18, 19])
                    min_out = random.choice([0, 15, 30])
                    check_in = datetime.combine(d, datetime.strptime(f"{hour_in:02d}:{min_in:02d}", "%H:%M").time())
                    check_out = datetime.combine(d, datetime.strptime(f"{hour_out:02d}:{min_out:02d}", "%H:%M").time())
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        status=AttendanceStatusEnum.present,
                    )
                attendance_records.append(rec)

        db.add_all(attendance_records)
        db.flush()

        # ── 5. Leave Requests ──────────────────────────────────────────────────
        leave_records = [
            # Alice: Approved Sick Leave (Past)
            LeaveRequest(
                employee_id=alice_emp.id,
                leave_type=LeaveTypeEnum.sick,
                start_date=today - timedelta(days=14),
                end_date=today - timedelta(days=13),
                remarks="Viral fever and rest",
                status=LeaveStatusEnum.approved,
                admin_comment="Approved. Get well soon!",
                decided_by=admin_user.id,
                decided_at=datetime.utcnow() - timedelta(days=14),
            ),
            # Alice: Pending Paid Leave (Upcoming)
            LeaveRequest(
                employee_id=alice_emp.id,
                leave_type=LeaveTypeEnum.paid,
                start_date=today + timedelta(days=5),
                end_date=today + timedelta(days=7),
                remarks="Family function in home town",
                status=LeaveStatusEnum.pending,
            ),
            # Bob: Rejected Unpaid Leave (Past)
            LeaveRequest(
                employee_id=bob_emp.id,
                leave_type=LeaveTypeEnum.unpaid,
                start_date=today - timedelta(days=5),
                end_date=today - timedelta(days=3),
                remarks="Personal travel",
                status=LeaveStatusEnum.rejected,
                admin_comment="Insufficient notice period. Please plan ahead.",
                decided_by=admin_user.id,
                decided_at=datetime.utcnow() - timedelta(days=5),
            ),
            # Bob: Pending Sick Leave (Upcoming)
            LeaveRequest(
                employee_id=bob_emp.id,
                leave_type=LeaveTypeEnum.sick,
                start_date=today + timedelta(days=2),
                end_date=today + timedelta(days=2),
                remarks="Dentist appointment",
                status=LeaveStatusEnum.pending,
            ),
        ]
        db.add_all(leave_records)
        db.flush()

        # ── 6. Payroll Structure & Initial Audit History ───────────────────────
        payroll_configs = [
            (alice_emp.id, 60000.0, 24000.0, 8500.0, 75500.0),
            (bob_emp.id, 55000.0, 22000.0, 7800.0, 69200.0),
            (admin_emp.id, 80000.0, 32000.0, 12000.0, 100000.0),
        ]

        now = datetime.utcnow()
        for emp_id, basic, hra, deductions, net_salary in payroll_configs:
            struct = PayrollStructure(
                employee_id=emp_id,
                basic=basic,
                hra=hra,
                deductions=deductions,
                net_salary=net_salary,
                effective_from=today - timedelta(days=60),
                updated_at=now,
            )
            hist = PayrollHistory(
                employee_id=emp_id,
                basic=basic,
                hra=hra,
                deductions=deductions,
                net_salary=net_salary,
                changed_by=admin_user.id,
                changed_at=now,
            )
            db.add_all([struct, hist])

        db.commit()

        print("\n" + "=" * 50)
        print("[OK] PostgreSQL database successfully seeded!")
        print("=" * 50)
        print("Demo Credentials:")
        print("  Admin:     admin@dayflow.io  /  Admin@123")
        print("  Employee:  alice@dayflow.io  /  Alice@123  (Verified)")
        print("  Employee:  bob@dayflow.io    /  Bob@123    (Unverified)")
        print("=" * 50 + "\n")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
