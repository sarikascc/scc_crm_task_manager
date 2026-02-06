import { requireAuth, hasPermission } from '@/lib/auth/utils'
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout'
import { EditUserClient } from './edit-user-client'
import { getUser } from '@/lib/users/actions'
import { notFound, redirect } from 'next/navigation'
import { MODULE_PERMISSION_IDS } from '@/lib/permissions'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const currentUser = await requireAuth()
    const canRead = await hasPermission(currentUser, MODULE_PERMISSION_IDS.users, 'read')

    if (!canRead) {
        redirect('/dashboard?error=unauthorized')
    }

    const canWrite = await hasPermission(currentUser, MODULE_PERMISSION_IDS.users, 'write')
    const { id } = await params

    const { data: user, error } = await getUser(id)

    if (error || !user) {
        notFound()
    }

    return (
        <DashboardLayout
            pageTitle="Edit User"
            userEmail={currentUser.email}
            userFullName={currentUser.fullName}
            userRole={currentUser.role}
            modulePermissions={currentUser.modulePermissions}
        >
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <EditUserClient user={user} readOnly={!canWrite} />
            </div>
        </DashboardLayout>
    )
}
