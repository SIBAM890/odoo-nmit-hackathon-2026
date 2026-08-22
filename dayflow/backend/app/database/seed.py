"""
Database seed script — creates demo data for hackathon demo.

Credentials (NEVER use in production):
  admin@dayflow.io  / Admin@123
  alice@dayflow.io  / Alice@123
  bob@dayflow.io    / Bob@123

Run: python -m app.database.seed
"""
from datetime import date, datetime, timedelta
import random
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.auth.security import hash_password
from app.database.db import SessionLocal, engine
from app.models import Base, User, Employee, Attendance, LeaveRequest, Payroll
from app.models.attendance import AttendanceStatus
from app.models.leave_request import LeaveStatus, LeaveType
from app.models.user import UserRole


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ── Users ──────────────────────────────────────────────────────────────
        admin_user = User(
            employee_id="ADM001",
            email="admin@dayflow.io",
            password_hash=hash_password("Admin@123"),
            role=UserRole.admin,
            is_verified=True,
        )
        alice_user = User(
            employee_id="EMP001",
            email="alice@dayflow.io",
            password_hash=hash_password("Alice@123"),
            role=UserRole.employee,
            is_verified=True,
        )
        bob_user = User(
            employee_id="EMP002",
            email="bob@dayflow.io",
            password_hash=hash_password("Bob@123"),
            role=UserRole.employee,
            is_verified=False,  # Bob hasn't verified email yet — demos the state
        )
        db.add_all([admin_user, alice_user, bob_user])
        db.flush()

        # ── Employee profiles ──────────────────────────────────────────────────
        admin_emp = Employee(
            user_id=admin_user.id,
            full_name="Admin HR",
            phone="+91-9000000001",
            address="NMIT Campus, Bangalore - 560064",
            job_title="HR Manager",
            department="Human Resources",
            date_of_joining=date(2022, 1, 15),
        )
        alice_emp = Employee(
            user_id=alice_user.id,
            full_name="Alice Johnson",
            phone="+91-9876543210",
            address="12, MG Road, Bengaluru - 560001",
            job_title="Software Engineer",
            department="Engineering",
            date_of_joining=date(2023, 6, 1),
        )
        bob_emp = Employee(
            user_id=bob_user.id,
            full_name="Bob Martinez",
            phone="+91-9123456789",
            address="45, Koramangala, Bengaluru - 560034",
            job_title="Product Designer",
            department="Design",
            date_of_joining=date(2024, 1, 10),
        )
        db.add_all([admin_emp, alice_emp, bob_emp])
        db.flush()

        # ── Attendance — 3 weeks history for Alice and Bob ────────────────────
        today = date.today()
        attendance_records = []

        for emp, name in [(alice_emp, "Alice"), (bob_emp, "Bob")]:
            for days_ago in range(1, 22):  # 21 days back
                d = today - timedelta(days=days_ago)
                if d.weekday() >= 5:  # skip weekends
                    continue

                # Simulate realistic patterns
                roll = random.random()
                if roll < 0.05:  # 5% absent
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        status=AttendanceStatus.absent,
                    )
                elif roll < 0.10:  # 5% half-day
                    check_in = datetime.combine(d, datetime.strptime("09:30", "%H:%M").time())
                    check_out = datetime.combine(d, datetime.strptime("13:00", "%H:%M").time())
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        status=AttendanceStatus.half_day,
                    )
                else:  # present
                    hour_in = random.randint(8, 10)
                    min_in = random.choice([0, 15, 30, 45])
                    hour_out = random.randint(17, 19)
                    check_in = datetime.combine(d, datetime.strptime(f"{hour_in:02d}:{min_in:02d}", "%H:%M").time())
                    check_out = datetime.combine(d, datetime.strptime(f"{hour_out:02d}:00", "%H:%M").time())
                    rec = Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        status=AttendanceStatus.present,
                    )
                attendance_records.append(rec)

        db.add_all(attendance_records)
        db.flush()

        # ── Leave requests ─────────────────────────────────────────────────────
        leave_records = [
            # Alice — approved sick leave (historical)
            LeaveRequest(
                employee_id=alice_emp.id,
                leave_type=LeaveType.sick,
                start_date=today - timedelta(days=14),
                end_date=today - timedelta(days=13),
                remarks="Fever and flu",
                status=LeaveStatus.approved,
                admin_comment="Approved. Get well soon!",
            ),
            # Alice — pending paid leave (upcoming)
            LeaveRequest(
                employee_id=alice_emp.id,
                leave_type=LeaveType.paid,
                start_date=today + timedelta(days=5),
                end_date=today + timedelta(days=7),
                remarks="Family function",
                status=LeaveStatus.pending,
            ),
            # Bob — rejected unpaid leave
            LeaveRequest(
                employee_id=bob_emp.id,
                leave_type=LeaveType.unpaid,
                start_date=today - timedelta(days=5),
                end_date=today - timedelta(days=3),
                remarks="Personal work",
                status=LeaveStatus.rejected,
                admin_comment="Insufficient notice period. Please plan ahead.",
            ),
            # Bob — pending sick leave
            LeaveRequest(
                employee_id=bob_emp.id,
                leave_type=LeaveType.sick,
                start_date=today + timedelta(days=2),
                end_date=today + timedelta(days=2),
                remarks="Doctor appointment",
                status=LeaveStatus.pending,
            ),
        ]
        db.add_all(leave_records)
        db.flush()

        # ── Payroll ───────────────────────────────────────────────────────────
        payroll_records = [
            Payroll(
                employee_id=alice_emp.id,
                basic=60000.0,
                hra=24000.0,
                deductions=8500.0,
                net_salary=75500.0,
                updated_at=datetime.utcnow(),
            ),
            Payroll(
                employee_id=bob_emp.id,
                basic=55000.0,
                hra=22000.0,
                deductions=7800.0,
                net_salary=69200.0,
                updated_at=datetime.utcnow(),
            ),
            Payroll(
                employee_id=admin_emp.id,
                basic=80000.0,
                hra=32000.0,
                deductions=12000.0,
                net_salary=100000.0,
                updated_at=datetime.utcnow(),
            ),
        ]
        db.add_all(payroll_records)
        db.commit()

        print("[OK] Seed complete.")
        print("   admin@dayflow.io  / Admin@123")
        print("   alice@dayflow.io  / Alice@123")
        print("   bob@dayflow.io    / Bob@123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
