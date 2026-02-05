import { requireRole } from '@/lib/auth/utils'
import { getUsers } from '@/lib/users/actions'
import UsersClient from './users-client'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>
}) {
  const currentUser = await requireRole(['admin'])
  const params = await searchParams
  const { data: users, error } = await getUsers({
    search: params.search,
    role: params.role,
    status: params.status,
  })

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>Failed to load users: {error}</p>
      </div>
    )
  }

  return <UsersClient initialUsers={users || []} currentUserId={currentUser.id} />
}
