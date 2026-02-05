import { requireRole } from '@/lib/auth/utils'
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout'
import { EditUserClient } from './edit-user-client'
import { getUser } from '@/lib/users/actions'
import { notFound } from 'next/navigation'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const currentUser = await requireRole(['admin'])
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
        >
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <EditUserClient user={user} />
            </div>
        </DashboardLayout>
    )
}
