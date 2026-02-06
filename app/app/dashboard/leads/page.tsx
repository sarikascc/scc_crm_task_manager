import { requireAuth, hasPermission } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'
import { LeadsClient } from './leads-client'
import { redirect } from 'next/navigation'
import { MODULE_PERMISSION_IDS } from '@/lib/permissions'

async function getLeads() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, company_name, phone, status, created_at, follow_up_date, created_by')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return data || []
}

export default async function LeadsPage() {
  const user = await requireAuth()
  const canRead = await hasPermission(user, MODULE_PERMISSION_IDS.leads, 'read')

  if (!canRead) {
    redirect('/dashboard?error=unauthorized')
  }

  const canWrite = await hasPermission(user, MODULE_PERMISSION_IDS.leads, 'write')
  const leads = await getLeads()

  return (
    <LeadsClient
      leads={leads}
      canWrite={canWrite}
    />
  )
}
