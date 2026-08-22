import AdminSidebar from '../components/AdminSidebar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-[240px] p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
