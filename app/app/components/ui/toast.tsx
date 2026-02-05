'use client'

import React, { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
    title: string
    message: string
    type: ToastType
    duration?: number
    onClose: () => void
}

export function Toast({ title, message, type, duration = 5000, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 300) // Match animation duration
    }

    const icons = {
        success: (
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" className="animate-check" />
            </svg>
        ),
        error: (
            <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
        info: (
            <svg className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    }

    const styles = {
        success: "border-emerald-500/20 bg-emerald-50/90 text-emerald-900 shadow-emerald-500/10",
        error: "border-rose-500/20 bg-rose-50/90 text-rose-900 shadow-rose-500/10",
        info: "border-sky-500/20 bg-sky-50/90 text-sky-900 shadow-sky-500/10",
    }

    return (
        <div
            className={`
                pointer-events-auto
                relative w-[340px] overflow-hidden rounded-2xl border p-4 backdrop-blur-md
                transition-all duration-300 ease-out
                ${styles[type]}
                ${isExiting ? 'translate-x-12 opacity-0' : 'translate-x-0 opacity-100 animate-slide-in-right'}
                shadow-2xl ring-1 ring-black/5
            `}
            role="alert"
        >
            <div className="flex gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm`}>
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-bold tracking-tight">{title}</p>
                    <p className="mt-1 text-xs font-medium leading-relaxed opacity-80 line-clamp-2">
                        {message}
                    </p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 rounded-lg p-1 text-current opacity-40 transition-opacity hover:opacity-100"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5">
                <div
                    className={`h-full opacity-40 transition-all duration-[linear] ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-sky-500'}`}
                    style={{
                        width: '0%',
                        animation: `toast-progress ${duration}ms linear forwards`
                    }}
                />
            </div>
        </div>
    )
}
