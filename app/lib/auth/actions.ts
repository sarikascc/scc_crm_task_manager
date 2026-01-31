'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(
  prevState: { error: string | null } | null,
  formData: FormData
) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: 'Email and password are required',
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (!data.user) {
    return {
      error: 'Invalid credentials',
    }
  }

  // Check if user exists in users table and is active
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, is_active, role')
    .eq('id', data.user.id)
    .single()

  if (userError || !userData) {
    // User not found in users table
    await supabase.auth.signOut()
    return {
      error: 'User not found. Please contact administrator.',
    }
  }

  if (!userData.is_active) {
    // User is inactive
    await supabase.auth.signOut()
    return {
      error: 'Your account has been deactivated. Please contact administrator.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

