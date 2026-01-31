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
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
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
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(allowedRoles: ('admin' | 'manager' | 'user')[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard?error=unauthorized')
  }

  return user
}

