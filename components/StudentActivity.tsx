'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'

export default function StudentActivity() {
  const [loginDates, setLoginDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)

      const { data } = await supabase
        .from('student_activity')
        .select('created_at')
        .eq('student_id', session.user.id)
        .eq('type', 'LOGIN')
        .gte('created_at', fromDate.toISOString())

      const dates =
        data?.map(d =>
          new Date(d.created_at).toISOString().split('T')[0]
        ) || []

      setLoginDates(dates)
      setLoading(false)
    }

    fetchActivity()
  }, [])

  if (loading) return null

  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  // 🔥 Calculate streak
  let streak = 0
  for (let i = last30Days.length - 1; i >= 0; i--) {
    if (loginDates.includes(last30Days[i])) streak++
    else break
  }

  return (
    <Card className="rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-lg border border-slate-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Login Activity
          </h2>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            🔥 {streak} day streak
          </span>
        </div>

        {/* Heatmap */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {last30Days.map(date => {
            const loggedIn = loginDates.includes(date)

            return (
              <div
                key={date}
                title={`${date} • ${
                  loggedIn ? 'Logged In' : 'No Activity'
                }`}
                className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-110 cursor-pointer
                  ${
                    loggedIn
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
              >
                {new Date(date).getDate()}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-slate-200" />
            No Login
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            Logged In
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
