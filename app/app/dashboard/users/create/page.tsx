import { requireRole } from '@/lib/auth/utils'
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout'
import { CreateUserClient } from './create-user-client'

export default async function CreateUserPage() {
    const currentUser = await requireRole(['admin'])

    return (
        <DashboardLayout
            pageTitle="Create User"
            userEmail={currentUser.email}
            userFullName={currentUser.fullName}
            userRole={currentUser.role}
        >
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <CreateUserClient />
            </div>
        </DashboardLayout>
    )
}
