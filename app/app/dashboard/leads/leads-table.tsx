import { EmptyState } from '@/app/components/empty-state'
import { Tooltip } from '@/app/components/ui/tooltip'

type Lead = {
  id: string
  name: string
  company_name: string | null
  phone: string
  status: 'new' | 'contacted' | 'follow_up' | 'converted' | 'lost'
  created_at: string
  follow_up_date: string | null
  created_by?: string
}

type SortField = 'name' | 'company_name' | 'phone' | 'status' | 'follow_up_date' | 'created_at' | null
type SortDirection = 'asc' | 'desc' | null

interface LeadsTableProps {
  leads: Lead[]
  currentUserId?: string
  userRole?: string
  onView: (leadId: string) => void
  onEdit: (leadId: string) => void
  onDelete: (leadId: string, leadName: string) => void
  sortField?: SortField
  sortDirection?: SortDirection
  onSort?: (field: SortField) => void
  isFiltered?: boolean
}

function StatusPill({ status }: { status: Lead['status'] }) {
  const styles = {
    new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-600', ring: 'ring-blue-600/20' },
    contacted: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-600', ring: 'ring-purple-600/20' },
    follow_up: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-600', ring: 'ring-orange-600/20' },
    converted: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-600', ring: 'ring-green-600/20' },
    lost: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-600', ring: 'ring-red-600/20' },
  }

  const labels = {
    new: 'New',
    contacted: 'Contacted',
    follow_up: 'Follow Up',
    converted: 'Converted',
    lost: 'Lost',
  }

  const style = styles[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${style.bg} ${style.text} ring-1 ring-inset ${style.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`}></span>
      {labels[status]}
    </span>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatFollowUpDate(dateString: string | null) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getFollowUpDateColor(dateString: string | null): string {
  if (!dateString) return 'text-gray-500'

  const followUpDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const followUpDateOnly = new Date(followUpDate)
  followUpDateOnly.setHours(0, 0, 0, 0)

  const diffTime = followUpDateOnly.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Red: today or past dates
  if (diffDays <= 0) {
    return 'text-rose-600 font-semibold'
  }

  // Orange: upcoming dates (within next 7 days)
  if (diffDays <= 7) {
    return 'text-amber-600 font-medium'
  }

  // Normal: other future dates
  return 'text-gray-900 font-medium'
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (!direction) {
    return (
      <svg className="ml-1 h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  }
  return direction === 'asc' ? (
    <svg className="ml-1 h-3.5 w-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="ml-1 h-3.5 w-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function LeadsTable({
  leads,
  currentUserId,
  userRole,
  onView,
  onEdit,
  onDelete,
  sortField = null,
  sortDirection = null,
  onSort,
  isFiltered = false,
}: LeadsTableProps) {
  const handleSort = (field: SortField) => {
    if (!onSort) return
    if (sortField === field) {
      onSort(sortDirection === 'asc' ? null : field)
    } else {
      onSort(field)
    }
  }

  const handleRowClick = (leadId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    onView(leadId)
  }

  if (leads.length === 0) {
    return (
      <div className="flex h-full w-full min-h-[500px] items-center justify-center bg-white">
        <div className="w-full max-w-lg">
          <EmptyState
            variant={isFiltered ? 'search' : 'leads'}
            title={isFiltered ? 'No leads found' : 'No leads yet'}
            description={
              isFiltered
                ? 'Try adjusting your filters.'
                : 'Create your first lead to get started.'
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-white">
      <table className="w-full table-fixed divide-y divide-gray-100">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="bg-gray-50/50">
            <th
              className="group w-[40%] sm:w-[20%] px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Lead Name
                <SortIcon direction={sortField === 'name' ? sortDirection : null} />
              </div>
            </th>
            <th
              className="group hidden sm:table-cell sm:w-[15%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSort('company_name')}
            >
              <div className="flex items-center">
                Company
                <SortIcon direction={sortField === 'company_name' ? sortDirection : null} />
              </div>
            </th>
            <th
              className="group w-[30%] sm:w-[15%] px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('phone')}
            >
              <div className="flex items-center">
                Phone
                <SortIcon direction={sortField === 'phone' ? sortDirection : null} />
              </div>
            </th>
            <th
              className="group w-[15%] sm:w-[12%] px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                <SortIcon direction={sortField === 'status' ? sortDirection : null} />
              </div>
            </th>
            <th
              className="group hidden md:table-cell md:w-[13%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSort('follow_up_date')}
            >
              <div className="flex items-center">
                Follow-up
                <SortIcon direction={sortField === 'follow_up_date' ? sortDirection : null} />
              </div>
            </th>
            <th
              className="group hidden lg:table-cell lg:w-[13%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center">
                Created
                <SortIcon direction={sortField === 'created_at' ? sortDirection : null} />
              </div>
            </th>
            <th className="w-[15%] sm:w-[12%] px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 transition-all duration-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {leads.map((lead) => {
            const canEdit =
              userRole === 'admin' || lead.created_by === currentUserId
            const canDelete = canEdit

            return (
              <tr
                key={lead.id}
                className="group transition-all duration-200 hover:bg-slate-50 cursor-pointer"
                onClick={(e) => handleRowClick(lead.id, e)}
              >
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm flex-shrink-0 ring-2 ring-white">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm sm:text-base font-semibold text-gray-900 leading-tight" title={lead.name}>
                        {lead.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hidden px-6 py-3 sm:table-cell">
                  <div className="truncate text-sm text-gray-500" title={lead.company_name || '—'}>
                    {lead.company_name || '—'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="truncate text-sm text-gray-500 font-medium" title={lead.phone}>
                    {lead.phone}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <StatusPill status={lead.status} />
                </td>
                <td className="hidden px-6 py-3 text-sm md:table-cell">
                  {lead.follow_up_date ? (
                    <span className={getFollowUpDateColor(lead.follow_up_date)}>
                      {formatFollowUpDate(lead.follow_up_date)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="hidden px-6 py-3 text-sm text-gray-500 lg:table-cell">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right text-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {canEdit && (
                      <Tooltip content="Edit lead details" position="left">
                        <button
                          onClick={() => onEdit(lead.id)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip content="Remove lead record" position="left">
                        <button
                          onClick={() => onDelete(lead.id, lead.name)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
