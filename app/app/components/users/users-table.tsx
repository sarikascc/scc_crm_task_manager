'use client'

import { UserData, toggleUserStatus } from '@/lib/users/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

type UsersTableProps = {
    users: UserData[]
    currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        setLoadingId(userId)
        await toggleUserStatus(userId, currentStatus)
        setLoadingId(null)
        router.refresh()
    }

    return (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Role
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {user.full_name || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{user.role}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex justify-end gap-3">
                                    <Link
                                        href={`/dashboard/users/${user.id}`}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </Link>
                                    {user.id !== currentUserId && (
                                        <button
                                            onClick={() => handleStatusToggle(user.id, user.is_active)}
                                            disabled={loadingId === user.id}
                                            className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                                } disabled:opacity-50`}
                                        >
                                            {loadingId === user.id ? '...' : user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
