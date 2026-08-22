import EmployeeSidebar from '../components/EmployeeSidebar'
import { Outlet } from 'react-router-dom'

export default function EmployeeLayout() {
  return (
    <div className="flex min-h-screen">
      <EmployeeSidebar />
      <main className="flex-1 ml-[240px] p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
