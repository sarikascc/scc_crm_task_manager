import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

export function createClient() {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )
}

