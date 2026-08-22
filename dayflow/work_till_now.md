# Dayflow - Project Blueprint & Progress Report

## 🎯 The Vision (What We Aim to Build Fully)
Dayflow is a production-grade Human Resource Management System (HRMS) built for the Odoo x NMIT Bangalore Hackathon 2026. The goal is to build an MVP that handles the core HR lifecycle—**Attendance, Leaves, and Payroll**—with a strict separation of concerns between standard Employees and HR Administrators.

**Key Principles:**
1. **No Fake Authorization**: All access controls (Employee vs. Admin) must be strictly enforced on the server-side via JWT and route dependencies.
2. **Real Data**: No hardcoded JSON mock data in the frontend. Everything must be backed by a real SQLite database.
3. **Clean UX/UI**: A custom, modern, glassmorphic design system built from scratch using Tailwind CSS v4, without relying on external UI component libraries.

---

## 🏗️ Work Completed So Far (Phase 1 to Phase 5)

We have successfully built the application end-to-end. Both the backend and frontend are complete and fully integrated.

### 1. Database & Schema (Backend)
- Designed and deployed SQLite ORM models using SQLAlchemy.
- Created schemas for `Users`, `Employees`, `Attendance`, `LeaveRequests`, and `Payroll`.
- Built a robust, idempotent seeding script (`seed.py`) that generates 3 weeks of realistic sample data for demo purposes.

### 2. API & Authentication (Backend)
- Implemented a secure auth flow using PyJWT and `bcrypt` for password hashing.
- Built dependency injection layers (`get_current_user`, `get_current_employee`, `require_admin`) to protect routes.
- Created fully functional CRUD endpoints for:
  - `/auth` (Login/Register)
  - `/employees` (Profile reading & updating)
  - `/attendance` (Check-in, Check-out, History, Admin overrides)
  - `/leaves` (Requests, Approvals, Rejections)
  - `/payroll` (Salary structures, Deductions, Net Pay calculation)

### 3. Frontend Architecture & Design System (Frontend)
- Bootstrapped Vite + React 18.
- Configured a custom design system in `index.css` featuring dark mode colors, glassmorphic cards, gradients, and subtle animations.
- Set up an `api.js` Axios service layer with automatic JWT injection via interceptors.
- Implemented React Router with strict Route Guards (`ProtectedRoute`, `AdminRoute`, `EmployeeRoute`).

### 4. Employee Module (Frontend)
- **Dashboard**: Live check-in/out logic, aggregate statistics (Present/Absent days), and quick summaries.
- **Profile**: View and edit personal contact details (phone, address, avatar).
- **Attendance**: Detailed history log natively formatting UTC timestamps.
- **Leave**: Modal-based leave request form, and a tracker for pending/approved/rejected requests.
- **Payroll**: Read-only breakdown of basic pay, HRA, deductions, and net salary.

### 5. Admin Module (Frontend)
- **Admin Dashboard**: Company-wide oversight metrics.
- **Employee Directory**: Searchable list with a detail view for editing roles, departments, and job titles.
- **Attendance Oversight**: Inline table editing to manually fix employee attendance statuses.
- **Leave Approvals**: A dedicated queue allowing admins to approve or reject requests with custom comments.
- **Payroll Setup**: Form to initialize new payroll structures and inline editing for existing salaries.

---

## 🚦 Next Steps & Future Enhancements

The core MVP is **100% complete** and ready for the hackathon demo. 

If we have extra time, future enhancements could include:
1. **PDF Generation**: Export payslips and attendance reports to PDF.
2. **Email Notifications**: Send automated emails when a leave request is approved or rejected.
3. **Advanced Analytics**: Add graphs (e.g., Chart.js) to the Admin Dashboard for visual attendance trends.
4. **Performance Reviews**: A new module for quarterly employee reviews.
