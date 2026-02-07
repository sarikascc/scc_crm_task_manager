/**
 * Pure helpers for team member work time. Not Server Actions (no 'use server').
 */

export type WorkTimeEvent = {
  user_id: string
  event_type: string
  occurred_at: string
}

export function computeMemberWorkSeconds(
  userId: string,
  events: WorkTimeEvent[],
  asOf?: string
): { totalSeconds: number; runningSince?: string; dayBreakdown: { date: string; seconds: number }[] } {
  const userEvents = events
    .filter((e) => e.user_id === userId)
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
  const asOfMs = asOf ? new Date(asOf).getTime() : Date.now()
  let totalSeconds = 0
  let runningSince: string | undefined
  const daySeconds: Record<string, number> = {}

  let segmentStart: number | null = null
  for (const ev of userEvents) {
    const t = new Date(ev.occurred_at).getTime()
    if (ev.event_type === 'start' || ev.event_type === 'resume') {
      segmentStart = t
    } else if ((ev.event_type === 'hold' || ev.event_type === 'end') && segmentStart !== null) {
      const end = ev.event_type === 'end' ? t : asOfMs
      const seg = Math.max(0, (end - segmentStart) / 1000)
      totalSeconds += seg
      const startDate = new Date(segmentStart)
      const endDate = new Date(end)
      for (let d = startDate.getTime(); d <= endDate.getTime(); d += 24 * 60 * 60 * 1000) {
        const key = new Date(d).toISOString().slice(0, 10)
        const dayStart = new Date(d).setHours(0, 0, 0, 0)
        const dayEnd = dayStart + 24 * 60 * 60 * 1000
        const segStart = Math.max(segmentStart, dayStart)
        const segEnd = Math.min(end, dayEnd)
        daySeconds[key] = (daySeconds[key] || 0) + (segEnd - segStart) / 1000
      }
      segmentStart = null
      if (ev.event_type === 'end') break
    }
  }
  if (segmentStart !== null) {
    runningSince = new Date(segmentStart).toISOString()
  }

  const dayBreakdown = Object.entries(daySeconds)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, seconds]) => ({ date, seconds }))

  return { totalSeconds, runningSince, dayBreakdown }
}
