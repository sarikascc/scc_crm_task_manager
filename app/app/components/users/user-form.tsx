'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, CreateUserFormData, UpdateUserFormData, ModulePermissions } from '@/lib/users/actions'
import { MODULES } from '@/lib/constants'

type UserFormProps = {
    initialData?: {
        id: string
        email: string
        full_name: string | null
        role: UserRole
        is_active: boolean
        module_permissions: ModulePermissions
    }
    mode: 'create' | 'edit'
    onSubmit: (data: any) => Promise<{ error?: string; success?: boolean }>
    onCancel: () => void
}

export function UserForm({ initialData, mode, onSubmit, onCancel }: UserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        email: initialData?.email || '',
        full_name: initialData?.full_name || '',
        password: '', // Only for create
        role: initialData?.role || 'user' as UserRole,
        is_active: initialData?.is_active ?? true,
        module_permissions: initialData?.module_permissions || {} as ModulePermissions
    })

    // Initialize permissions with 'none' for all modules if empty
    useEffect(() => {
        if (Object.keys(formData.module_permissions).length === 0) {
            const initialPermissions: ModulePermissions = {}
            MODULES.forEach(m => {
                initialPermissions[m.id] = 'none'
            })
            setFormData(prev => ({ ...prev, module_permissions: initialPermissions }))
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePermissionChange = (moduleId: string, level: 'read' | 'write' | 'none') => {
        setFormData(prev => ({
            ...prev,
            module_permissions: {
                ...prev.module_permissions,
                [moduleId]: level
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate
        if (mode === 'create' && !formData.password) {
            setError("Password is required for new users")
            setLoading(false)
            return
        }

        try {
            const result = await onSubmit(formData)
            if (result.error) {
                setError(result.error)
            } else {
                // Success handled by parent or redirect
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const showPermissions = formData.role === 'staff' || formData.role === 'client'

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        required
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        disabled={mode === 'edit'}
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="user">User (Basic)</option>
                        <option value="staff">Staff</option>
                        <option value="client">Client</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Status (Edit only or always?) Let's allow for both */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="is_active"
                                checked={formData.is_active === true}
                                onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="is_active"
                                checked={formData.is_active === false}
                                onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Inactive</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Password - Only for Create or if we want to allow reset (ignoring reset for now as per simple plan) */}
            {mode === 'create' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Set initial password"
                    />
                </div>
            )}

            {/* Permissions Section */}
            {showPermissions && (
                <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Module Permissions</h3>
                    <div className="space-y-4">
                        {MODULES.map((module) => (
                            <div key={module.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b last:border-0 border-gray-200 pb-3 last:pb-0">
                                <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{module.label}</span>
                                <div className="flex space-x-4">
                                    {(['read', 'write', 'none'] as const).map((level) => (
                                        <label key={level} className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name={`perm_${module.id}`}
                                                checked={(formData.module_permissions[module.id] || 'none') === level}
                                                onChange={() => handlePermissionChange(module.id, level)}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm capitalize text-gray-700">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
