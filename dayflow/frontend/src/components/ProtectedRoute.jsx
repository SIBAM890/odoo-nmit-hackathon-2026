/**
 * Route guards — redirect unauthenticated or wrong-role users.
 * ProtectedRoute: any logged-in user
 * AdminRoute: admin only
 * EmployeeRoute: employee only
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/employee/dashboard" replace />
  return children
}

export function EmployeeRoute({ children }) {
  const { user, isEmployee } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isEmployee) return <Navigate to="/admin/dashboard" replace />
  return children
}
