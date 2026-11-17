'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { AcademyKpiStrip } from './_components/academy-kpi-strip'
import { EnrollmentActivityChart } from './_components/enrollment-activity-chart'
import { CapstonePipelineCard } from './_components/capstone-pipeline-card'
import { ProjectPulseCard } from './_components/project-pulse-card'
import { UpcomingSessionsCard } from './_components/upcoming-sessions-card'
import { StudentProgressTable } from './_components/student-progress-table'
import { CoursesOverviewSection } from './_components/courses-overview-section'
import type { TeacherDashboardPayload } from './_components/types'

export default function TeacherDashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const [data, setData] = useState<TeacherDashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
    }
  }, [isLoaded, user, router])

  const loadDashboard = useCallback(
    async (selectedScope: 'all' | 'mine', isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }
        setErrorMsg(null)

        const res = await fetch(`/api/teacher/dashboard?scope=${selectedScope}`, {
          cache: 'no-store',
        })

        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(payload?.error || `Failed to load dashboard (${res.status})`)
        }

        setData(payload)
        if (isManualRefresh) {
          toast.success('Dashboard metrics refreshed')
        }
      } catch (err: any) {
        const message = err?.message || 'Unable to load academy dashboard data'
        setErrorMsg(message)
        if (isManualRefresh) {
          toast.error(message)
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!isLoaded || !user) return
    loadDashboard(scope)
  }, [isLoaded, user, scope, loadDashboard])

  if (!isLoaded || !user) {
    return null
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-[340px] rounded-xl" />
          <Skeleton className="lg:col-span-5 h-[340px] rounded-xl" />
        </div>

        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (errorMsg && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Dashboard Unavailable</h2>
            <p className="text-xs text-slate-500">{errorMsg}</p>
          </div>
          <Button
            onClick={() => loadDashboard(scope)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isSuperAdmin = user.role === 'super_admin' || data.role === 'super_admin'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academy Overview</h1>
          <p className="text-sm text-slate-500">
            Course enrollments, capstone review milestones, and learner assessment activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  scope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Academy
              </button>
              <button
                type="button"
                onClick={() => setScope('mine')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  scope === 'mine'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Courses
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => loadDashboard(scope, true)}
            className="h-9 text-xs font-medium text-slate-700 border-slate-200 bg-white gap-1.5 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/teacher/courses/create" className="shrink-0">
            <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5 whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4-Column KPI Strip */}
      <AcademyKpiStrip summary={data.summary} />

      {/* Middle 12-Col Analytics Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <EnrollmentActivityChart data={data.activitySeries} />
        </div>
        <div className="lg:col-span-5">
          <CapstonePipelineCard pipeline={data.capstonePipeline} />
        </div>
      </div>

      {data.projects && <ProjectPulseCard projects={data.projects} />}

      {/* Second Row: Student Progress Table & Scheduled Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <StudentProgressTable rows={data.studentProgress} />
        </div>
        <div className="lg:col-span-5">
          <UpcomingSessionsCard
            meetings={data.upcomingMeetings}
            pendingApprovals={data.summary.pendingApprovals}
            pendingCertificates={data.summary.pendingCertificates}
          />
        </div>
      </div>

      {/* Bottom Course Catalog Table/Grid */}
      <CoursesOverviewSection courses={data.courses} />
    </div>
  )
}