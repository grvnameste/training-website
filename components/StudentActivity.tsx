<<<<<<< HEAD
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
=======
'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from "@clerk/nextjs"

export default function StudentActivity() {
  const [loginDates, setLoginDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const { user, isLoaded } = useUser()

  useEffect(() => {

    const fetchActivity = async () => {

      // ✅ Clerk user check
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }

      console.log("CLERK USER:", user.id)

      // ✅ STEP 1: get profile using clerk_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single()

      console.log("PROFILE:", profile)
      console.log("PROFILE ERROR:", profileError)

      if (!profile) {
        console.log("❌ PROFILE NOT FOUND")
        setLoading(false)
        return
      }

      // 🔥 INSERT LOGIN (only once per day)
      const today = new Date().toISOString().split('T')[0]

      const { data: existing, error: existingError } = await supabase
        .from('student_activity')
        .select('id')
        .eq('student_id', profile.id)
        .eq('type', 'LOGIN')
        .gte('created_at', today)

      console.log("EXISTING:", existing)
      console.log("EXISTING ERROR:", existingError)

      if (!existing || existing.length === 0) {
        const { error: insertError } = await supabase
          .from('student_activity')
          .insert({
            student_id: profile.id,
            type: 'LOGIN'
          })

        console.log("INSERT ERROR:", insertError)
        console.log("✅ INSERT DONE")
      }

      // ✅ FETCH LAST 30 DAYS
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)

      const { data, error } = await supabase
        .from('student_activity')
        .select('created_at')
        .eq('student_id', profile.id)
        .eq('type', 'LOGIN')
        .gte('created_at', fromDate.toISOString())

      console.log("FETCH DATA:", data)
      console.log("FETCH ERROR:", error)

      const dates =
        data?.map(d =>
          new Date(d.created_at).toISOString().split('T')[0]
        ) || []

      setLoginDates(dates)
      setLoading(false)
    }

    fetchActivity()

  }, [user, isLoaded])

  if (loading) return <div className="p-6">Loading...</div>

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Login Activity
          </h2>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            🔥 {streak} day streak
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {last30Days.map(date => {
            const loggedIn = loginDates.includes(date)

            return (
              <div
                key={date}
                className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold
                  ${loggedIn
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                  }`}
              >
                {new Date(date).getDate()}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
