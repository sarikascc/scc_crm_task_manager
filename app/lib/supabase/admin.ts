import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './env'

export function createAdminClient() {
    return createClient<Database>(
        getSupabaseUrl(),
        getSupabaseServiceRoleKey(),
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
