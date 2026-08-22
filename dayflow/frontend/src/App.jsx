import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, EmployeeRoute, AdminRoute } from './components/ProtectedRoute'

// Layouts
import EmployeeLayout from './layouts/EmployeeLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeProfile from './pages/employee/EmployeeProfile'
import EmployeeAttendance from './pages/employee/EmployeeAttendance'
import EmployeeLeave from './pages/employee/EmployeeLeave'
import EmployeePayroll from './pages/employee/EmployeePayroll'

// Dummy Admin Pages for now (to avoid routing errors if we try to click them)
const DummyAdmin = ({ title }) => <div className="p-8 text-white"><h1 className="page-title">{title}</h1><p className="text-slate-400 mt-2">Coming soon in Phase 5.</p></div>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeRoute><EmployeeLayout /></EmployeeRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leave" element={<EmployeeLeave />} />
            <Route path="payroll" element={<EmployeePayroll />} />
          </Route>

          {/* Admin Routes (Phase 5 stubs) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DummyAdmin title="Admin Dashboard" />} />
            <Route path="employees" element={<DummyAdmin title="Manage Employees" />} />
            <Route path="attendance" element={<DummyAdmin title="Attendance Oversight" />} />
            <Route path="leaves" element={<DummyAdmin title="Leave Approvals" />} />
            <Route path="payroll" element={<DummyAdmin title="Payroll Management" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
