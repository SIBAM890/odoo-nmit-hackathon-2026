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

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEmployees from './pages/admin/AdminEmployees'
import AdminEmployeeDetail from './pages/admin/AdminEmployeeDetail'
import AdminAttendance from './pages/admin/AdminAttendance'
import AdminLeaves from './pages/admin/AdminLeaves'
import AdminPayroll from './pages/admin/AdminPayroll'

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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="employees/:id" element={<AdminEmployeeDetail />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="payroll" element={<AdminPayroll />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
