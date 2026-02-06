'use client'

import { UserForm } from '@/app/components/users/user-form'
import { updateUser, UserData } from '@/lib/users/actions'
import { useRouter } from 'next/navigation'

type EditUserClientProps = {
    user: UserData
    readOnly?: boolean
}

export function EditUserClient({ user, readOnly = false }: EditUserClientProps) {
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        if (readOnly) {
            return { error: 'Read-only access', success: false }
        }
        // Remove password if empty (though form handles this logic mostly, backend ignores it if not provided in update)
        const result = await updateUser(user.id, data)
        if (result.success) {
            router.push('/dashboard/users')
            router.refresh()
        }
        return result
    }

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit User</h3>
                <div className="mt-5">
                    <UserForm
                        mode="edit"
                        initialData={user}
                        onSubmit={handleSubmit}
                        onCancel={() => router.back()}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    )
}
