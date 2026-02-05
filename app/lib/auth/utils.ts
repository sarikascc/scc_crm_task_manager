import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch user data from users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    // Fetch all columns to be robust against schema changes (like missing module_permissions)
    // and handle undefined properties gracefully in return object
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('User consistency error:', userError)
    // If Auth thinks we are logged in but DB disagrees (or errors), 
    // we must sign out to prevent middleware -> page -> login -> middleware redirect loop
    await supabase.auth.signOut()
    return null
  }

  if (!userData.is_active) {
    // Inactive user - sign them out
    await supabase.auth.signOut()
    redirect('/login?error=inactive')
  }

  return {
    id: userData.id,
    email: userData.email,
    fullName: userData.full_name,
    role: userData.role,
    isActive: userData.is_active,
    // Handle case where column might be missing (migration not run)
    modulePermissions: userData.module_permissions || {},
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(allowedRoles: ('admin' | 'manager' | 'user' | 'staff' | 'client')[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard?error=unauthorized')
  }

  return user
}

export async function hasPermission(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
  module: string,
  requiredLevel: 'read' | 'write'
): Promise<boolean> {
  if (!user) return false
  if (user.role === 'admin') return true

  // Managers have access to most things, but we can refine this if needed
  if (user.role === 'manager') {
    // Manage users and system settings denial for manager as per requirement
    if (module === 'users' || module === 'settings') return false
    return true
  }

  const permission = user.modulePermissions[module]
  if (!permission || permission === 'none') return false

  if (requiredLevel === 'read') return permission === 'read' || permission === 'write'
  if (requiredLevel === 'write') return permission === 'write'

  return false
}

