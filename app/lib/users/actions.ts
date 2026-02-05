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

export async function getUsers() {
    const supabase = await createClient()

    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return { error: 'Failed to fetch users' }
    }

    return { data: users as UserData[] }
}

export async function getUser(id: string) {
    const supabase = await createClient()

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

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
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
            full_name: formData.full_name,
            role: formData.role,
        },
        email_confirm: true, // Auto-confirm email since admin created it
    })

    if (authError || !authData.user) {
        console.error('Error creating auth user:', authError)
        return { error: authError?.message || 'Failed to create user authentication' }
    }

    // 2. The trigger `handle_new_user` should automatically insert into `users` table.
    // However, it might not set `module_permissions` correctly if we didn't pass it in metadata (and trigger doesn't read it from there yet),
    // OR we should just update the user record explicitly to be safe and ensure permissions are set.

    // Let's update the user record with the permissions and correct role (trigger sets role from metadata, but permissions need manual update)
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .update({
            role: formData.role,
            module_permissions: formData.module_permissions,
            full_name: formData.full_name, // Ensure sync
            is_active: true
        })
        .eq('id', authData.user.id)

    if (dbError) {
        // If DB update fails, we might want to delete the auth user to avoid inconsistency, 
        // but for now let's just report error.
        console.error('Error updating user profile:', dbError)
        // Try to cleanup
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: 'Failed to create user profile' }
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
        .update(updates)
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

export async function toggleUserStatus(id: string, currentStatus: boolean) {
    await requireRole(['admin'])
    const supabase = await createClient()

    const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', id)

    if (error) {
        return { error: 'Failed to update status' }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}
