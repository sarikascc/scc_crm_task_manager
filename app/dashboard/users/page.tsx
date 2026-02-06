import { requireAuth, hasPermission } from '@/lib/auth/utils'
import { getUsers } from '@/lib/users/actions'
import UsersClient from './users-client'
import { redirect } from 'next/navigation'
import { MODULE_PERMISSION_IDS } from '@/lib/permissions'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>
}) {
  const currentUser = await requireAuth()
  const canRead = await hasPermission(currentUser, MODULE_PERMISSION_IDS.users, 'read')

  if (!canRead) {
    redirect('/dashboard?error=unauthorized')
  }

  const canWrite = await hasPermission(currentUser, MODULE_PERMISSION_IDS.users, 'write')
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

  return <UsersClient initialUsers={users || []} currentUserId={currentUser.id} canWrite={canWrite} />
}
