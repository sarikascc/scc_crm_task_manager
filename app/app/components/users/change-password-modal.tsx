'use client'

import { useState } from 'react'
import { UserData, changeUserPassword } from '@/lib/users/actions'
import { useToast } from '@/app/components/ui/toast-context'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
    user?: UserData
}

export function ChangePasswordModal({ isOpen, onClose, user }: ChangePasswordModalProps) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setLocalError] = useState<string | null>(null)
    const { success: showSuccess, error: showError } = useToast()

    if (!isOpen || !user) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            const result = await changeUserPassword(user.id, password)
            if (result.error) {
                showError('Update Failed', result.error)
            } else {
                showSuccess('Password Updated', `Access credentials for ${user.full_name} have been reset.`)
                onClose()
                setPassword('')
                setConfirmPassword('')
            }
        } catch (err: any) {
            showError('Error', err.message || "Failed to change password")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-[#06B6D4] focus:outline-none focus:ring-4 focus:ring-[#06B6D4]/10 sm:text-sm hover:border-slate-300"
    const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5"

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-slide-up-fade"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                        <p className="text-xs text-slate-500 font-medium">Resetting for <span className="text-cyan-600">{user.full_name}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-800 font-medium animate-in fade-in zoom-in-95 duration-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className={labelClasses}>New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient-smooth w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-100 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
