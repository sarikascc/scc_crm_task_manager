import { requireAuth } from '@/lib/auth/utils'
import { logout } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">CRM Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.fullName || user.email} ({user.role})
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900">Welcome to the Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Authentication is working correctly. Your role: <strong>{user.role}</strong>
          </p>
        </div>
      </main>
    </div>
  )
}

