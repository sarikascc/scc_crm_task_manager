'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'

export type UserRole = Database['public']['Enums']['user_role']
export type ModulePermissions = Record<string, 'read' | 'write' | 'none'>

export type UserData = {
    id: string
    email: string
    full_name: string | null
    role: UserRole
    is_active: boolean
    module_permissions: ModulePermissions
    created_at: string
    deleted_at?: string | null
}

export type CreateUserFormData = {
    email: string
    password: string
    full_name: string
    role: UserRole
    module_permissions: ModulePermissions
}

export type UpdateUserFormData = {
    full_name?: string
    role?: UserRole
    is_active?: boolean
    module_permissions?: ModulePermissions
    password?: string // Optional password update
}

export async function getUsers(filters?: { search?: string; role?: string; status?: string }) {
    const supabase = await createClient()

    let query = (supabase
        .from('users')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }) as any)

    if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
    }

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active')
    }

    const { data: users, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
        return { error: 'Failed to fetch users' }
    }

    return { data: users as UserData[] }
}

export async function getUser(id: string) {
    const supabase = await createClient()

    const { data: user, error } = await (supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single() as any)

    if (error) {
        console.error('Error fetching user:', error)
        return { error: 'Failed to fetch user' }
    }

    return { data: user as UserData }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/utils'

export async function createUser(formData: CreateUserFormData) {
    // Security check
    await requireRole(['admin'])

    const supabaseAdmin = createAdminClient()

    // 1. Create user in Supabase Auth
    // We pass NO metadata initially to make the trigger as "light" as possible
    // This prevents the trigger from trying to cast roles that might not exist yet.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
    })

    if (authError || !authData.user) {
        console.error('Auth Error Details:', authError)
        // If it's a database error, we want the user to see the EXACT details (e.g., which column or type is failing)
        const isDbError = authError?.message?.includes('Database error')
        return {
            error: isDbError
                ? `Database Error: ${authError?.message}. (Check if your users table and user_role enum are up to date)`
                : (authError?.message || 'Failed to create user account')
        }
    }

    // 2. Explicitly update/insert the profile
    // Since the trigger might have failed OR we want to ensure specific data,
    // we use an "upsert" to be safe.
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .upsert({
            id: authData.user.id,
            email: formData.email,
            role: formData.role,
            module_permissions: formData.module_permissions as any,
            full_name: formData.full_name,
            is_active: true,
            updated_at: new Date().toISOString()
        } as any)

    if (dbError) {
        console.error('Profile Sync Error:', dbError)
        // Cleanup the auth user since we couldn't create the profile
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: 'Auth account created, but profile sync failed. Please check DB roles.' }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function updateUser(id: string, formData: UpdateUserFormData) {
    await requireRole(['admin'])
    const supabase = await createClient()

    const updates: any = {
        ...formData,
        updated_at: new Date().toISOString(),
    }

    // Remove password from direct update to `users` table (it's in auth)
    delete updates.password

    const { error } = await supabase
        .from('users')
        .update(updates as any)
        .eq('id', id)

    if (error) {
        console.error('Error updating user:', error)
        return { error: 'Failed to update user' }
    }

    // If password update is needed, we need Admin API or user needs to allow it.
    // We can use Admin API here if password is provided
    if (formData.password) {
        const supabaseAdmin = createAdminClient()
        const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(id, { password: formData.password })
        if (pwError) {
            console.error('Error updating password:', pwError)
            return { error: 'Failed to update password' }
        }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function deleteUser(id: string) {
    await requireRole(['admin'])
    const supabaseAdmin = createAdminClient()

    // Soft delete: set deleted_at and is_active to false
    const { error } = await supabaseAdmin
        .from('users')
        .update({
            deleted_at: new Date().toISOString(),
            is_active: false
        } as any)
        .eq('id', id)

    if (error) {
        console.error('Error deleting user:', error)
        return { error: 'Failed to delete user' }
    }

    // Optionally sign out the user sessions if they're logged in
    // Note: This won't immediately kick them out if they have a valid session, 
    // but they won't be able to log in again or perform actions if RLS checks for deleted_at.

    revalidatePath('/dashboard/users')
    return { success: true }
}
export async function changeUserPassword(userId: string, password: string) {
    await requireRole(['admin'])
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password
    })

    if (error) {
        console.error('Error changing password:', error)
        return { error: error.message || 'Failed to change password' }
    }

    return { success: true }
}
