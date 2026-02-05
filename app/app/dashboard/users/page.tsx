import { requireRole } from '@/lib/auth/utils'
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout'
import { getUsers } from '@/lib/users/actions'
import { UsersTable } from '@/app/components/users/users-table'
import Link from 'next/link'

export default async function UsersPage() {
  const currentUser = await requireRole(['admin'])
  const { data: users, error } = await getUsers()

  return (
    <DashboardLayout
      pageTitle="User Management"
      userEmail={currentUser.email}
      userFullName={currentUser.fullName}
      userRole={currentUser.role}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all users including their name, role, and current status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/dashboard/users/create"
              className="btn-gradient-smooth rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#06B6D4]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#06B6D4]/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2"
            >
              Add User
            </Link>
          </div>
        </div>
        <div className="mt-8">
          {error ? (
            <div className="rounded-md bg-red-50 p-4">
              <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          ) : (
            <UsersTable users={users || []} currentUserId={currentUser.id} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
