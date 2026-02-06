'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/app/components/ui/toast'

interface ToastMessage {
    id: string
    title: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    showToast: (title: string, message: string, type: ToastType, duration?: number) => void
    success: (title: string, message: string, duration?: number) => void
    error: (title: string, message: string, duration?: number) => void
    info: (title: string, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback((title: string, message: string, type: ToastType, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, title, message, type, duration }])
    }, [])

    const success = useCallback((title: string, message: string, duration = 5000) => {
        showToast(title, message, 'success', duration)
    }, [showToast])

    const error = useCallback((title: string, message: string, duration = 5000) => {
        showToast(title, message, 'error', duration)
    }, [showToast])

    const info = useCallback((title: string, message: string, duration = 5000) => {
        showToast(title, message, 'info', duration)
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, success, error, info }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
