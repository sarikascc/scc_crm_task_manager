import { requireAuth } from '@/lib/auth/utils'
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      userEmail={user.email}
      userFullName={user.fullName}
      userRole={user.role}
    >
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#1E1B4B]">Welcome to the Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Authentication is working correctly. Your role: <strong>{user.role}</strong>
        </p>
      </div>
    </DashboardLayout>
  )
}

