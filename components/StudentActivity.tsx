'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/hooks/useUser'

type ActivityRow = {
  id: string
  type: string | null
  createdAt: string
}

const LABELS: Record<string, string> = {
  QUIZ_COMPLETED: 'Completed an assessment',
  QUESTIONNAIRE_COMPLETED: 'Completed onboarding',
  STAGE1_SUBMITTED: 'Submitted requirements',
  STAGE3_SUBMITTED: 'Submitted project deliverables',
}

export default function StudentActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      return
    }

    let active = true
    fetch('/api/me/activity', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok && active) setRows(data.activity ?? [])
      })
      .catch((err) => console.error('Activity fetch error:', err))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, isLoaded])

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading activity history…</div>
  }

  const activeDates = new Set(
    rows.map((row) => new Date(row.createdAt).toISOString().split('T')[0])
  )
  const last30Days = Array.from({ length: 30 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    return date.toISOString().split('T')[0]
  })

  let streak = 0
  for (let i = last30Days.length - 1; i >= 0; i--) {
    if (activeDates.has(last30Days[i])) streak++
    else break
  }

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Learning Activity (Last 30 Days)</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
            {streak} {streak === 1 ? 'day' : 'days'} streak
          </span>
        </div>

        <div className="mb-6 grid grid-cols-7 gap-2">
          {last30Days.map((date) => {
            const active = activeDates.has(date)
            return (
              <div
                key={date}
                title={`${date}: ${active ? 'Activity recorded' : 'No activity'}`}
                className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold ${
                  active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {new Date(date).getDate()}
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">
              No activity recorded yet. Complete a lesson, assessment, or project milestone.
            </p>
          ) : (
            rows.slice(0, 8).map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">
                  {LABELS[row.type ?? ''] || row.type || 'Activity'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
