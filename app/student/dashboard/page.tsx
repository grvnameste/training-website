<<<<<<< HEAD
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Loader2,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface CourseProgress {
  totalLessons: number
  completedLessons: number
  percentage: number
  resumeLessonId: string | null
}

interface DashboardCourse {
  courseId: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  price: string | null
  progress: CourseProgress
}

interface Recommendation {
  id: string
  title: string
  subtitle: string | null
  thumbnailUrl: string | null
  price: number
  level: string
  reason: string
}

interface DashboardPayload {
  continueLearning: {
    courseId: string
    courseTitle: string
    lessonId: string
    lessonTitle: string
    positionSeconds: number
    percentage: number
  } | null
  courses: DashboardCourse[]
  onboardingCompleted: boolean
  recommendations?: Recommendation[]
  assignments?: {
    id: string
    title: string
    courseTitle: string
    dueAt: string | null
    isRequired: boolean
    isOverdue: boolean
    canSubmit: boolean
    latestSubmission: { status: string; attempt: number } | null
  }[]
  assignmentCounts?: { total: number; pending: number; overdue: number }
  projects?: {
    id: string
    templateTitle: string
    courseTitle: string
    status: string
    progress: number
    totalMilestones: number
    approvedMilestones: number
    currentMilestoneId: string | null
    currentMilestoneTitle: string | null
    currentMilestoneDueAt: string | null
    dueSoonMilestones: number
    overdueMilestones: number
  }[]
  availableProjects?: number
  projectCounts?: {
    total: number
    active: number
    completed: number
    available: number
    dueSoonMilestones: number
    overdueMilestones: number
  }
  nextActions?: {
    kind: 'assignment' | 'project'
    label: string
    detail: string
    href: string
    tone: 'danger' | 'warning' | 'info'
  }[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/login')
      return
    }

    let active = true
    fetch('/api/me/dashboard', { cache: 'no-store' })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(payload?.error || 'Could not load your dashboard')
        return payload as DashboardPayload
      })
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'Could not load your dashboard')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isLoaded, user, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading your learning plan…</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.refresh()}>
          Try again
        </Button>
      </Card>
    )
  }

  const courses = data?.courses ?? []
  const continueLearning = data?.continueLearning ?? null

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Student dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-sm text-slate-600">
          Your next lesson, current progress, and recommended path are below.
        </p>
      </div>

      {continueLearning ? (
        <Card className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700">
                <PlayCircle className="h-4 w-4" /> Continue learning
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {continueLearning.lessonTitle}
              </h2>
              <p className="text-sm text-slate-600">
                {continueLearning.courseTitle} · {continueLearning.percentage}% complete
                {continueLearning.positionSeconds > 0
                  ? ` · resume at ${Math.floor(continueLearning.positionSeconds / 60)}m`
                  : ''}
              </p>
            </div>
            <Link
              href={`/student/courses/${continueLearning.courseId}/play/${continueLearning.lessonId}`}
            >
              <Button className="h-12 rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700">
                Resume lesson <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            {courses.length > 0 ? 'You are caught up' : 'Start your first course'}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {courses.length > 0
              ? 'Every lesson in your current courses is complete. Explore the catalog for your next path.'
              : 'Choose a published course and your next lesson will appear here.'}
          </p>
          <Link href="/student/courses">
            <Button className="mt-5 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
              Explore courses <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}

      {(data?.nextActions?.length ?? 0) > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data!.nextActions!.map((action) => (
            <Link key={`${action.kind}-${action.href}`} href={action.href}>
              <Card
                className={`h-full rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                  action.tone === 'danger'
                    ? 'border-red-200 bg-red-50/60'
                    : action.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {action.tone === 'danger' ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                    ) : action.kind === 'project' ? (
                      <FolderKanban className="mt-0.5 h-4 w-4 text-blue-600" />
                    ) : (
                      <ClipboardList className="mt-0.5 h-4 w-4 text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{action.detail}</p>
                    </div>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {(data?.projectCounts?.total ?? 0) + (data?.projectCounts?.available ?? 0) > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
            <Link href="/student/projects" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Active', value: data?.projectCounts?.active ?? 0 },
              { label: 'Completed', value: data?.projectCounts?.completed ?? 0 },
              { label: 'Due soon', value: data?.projectCounts?.dueSoonMilestones ?? 0 },
              { label: 'Overdue', value: data?.projectCounts?.overdueMilestones ?? 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold tabular-nums ${
                    stat.label === 'Overdue' && stat.value > 0
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {(data?.projects?.length ?? 0) > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {data!.projects!.slice(0, 2).map((project) => (
                <Card key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {project.courseTitle}
                      </p>
                      <h3 className="mt-1 font-semibold text-slate-900">
                        {project.templateTitle}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                      {project.status}
                    </span>
                  </div>

                  {project.currentMilestoneTitle && (
                    <p className="mt-2 text-xs text-slate-500">
                      Next: {project.currentMilestoneTitle}
                      {project.currentMilestoneDueAt
                        ? ` · due ${new Date(
                            project.currentMilestoneDueAt
                          ).toLocaleDateString()}`
                        : ''}
                    </p>
                  )}

                  {(project.overdueMilestones > 0 || project.dueSoonMilestones > 0) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                      {project.overdueMilestones > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                          {project.overdueMilestones} overdue
                        </span>
                      )}
                      {project.dueSoonMilestones > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                          {project.dueSoonMilestones} due soon
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {project.approvedMilestones}/{project.totalMilestones} milestones
                      </span>
                      <span className="font-semibold text-slate-700">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    className="mt-3 w-full rounded-xl bg-slate-900 text-white hover:bg-blue-600"
                    onClick={() => router.push(`/student/projects/${project.id}`)}
                  >
                    Open project <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {(data?.assignments?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Assignments</h2>
            <Link href="/student/assignments" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {data!.assignments!.slice(0, 4).map((assignment) => {
              const status = assignment.latestSubmission?.status
              return (
                <Card key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {assignment.courseTitle}
                      </p>
                      <h3 className="mt-1 font-semibold text-slate-900">{assignment.title}</h3>
                    </div>
                    {assignment.isOverdue ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        Overdue
                      </span>
                    ) : assignment.isRequired && !status ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Due
                      </span>
                    ) : status ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                        {status.replace('_', ' ')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {assignment.dueAt
                      ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                      : 'No deadline'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full rounded-xl"
                    onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {status ? 'View feedback' : 'Open assignment'}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {!data?.onboardingCompleted && (
        <Card className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-indigo-950">
                  Personalize your learning path
                </p>
                <p className="text-sm text-indigo-800">
                  Tell us your goal and weekly availability. This is optional and does not lock any course.
                </p>
              </div>
            </div>
            <Link href="/student/onboarding">
              <Button variant="outline" className="border-indigo-300 bg-white text-indigo-800">
                Personalize
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {(data?.recommendations?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recommended for you</h2>
            <Link href="/student/onboarding" className="text-sm font-medium text-blue-600 hover:underline">
              Edit preferences
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {data!.recommendations!.slice(0, 3).map((course) => (
              <Card
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">
                    {course.level}
                  </span>
                  <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {course.subtitle || course.reason}
                </p>
                <p className="mt-2 text-xs font-medium text-emerald-700">{course.reason}</p>
                <Button
                  variant="outline"
                  className="mt-auto w-full rounded-xl"
                  onClick={() => router.push(`/student/courses/${course.id}`)}
                >
                  View course
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your courses</h2>
          <Link href="/student/courses" className="text-sm font-medium text-blue-600 hover:underline">
            Browse catalog
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.courseId}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-40 w-full bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="line-clamp-2 font-semibold text-slate-900">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {course.description || 'Structured learning with practical lessons.'}
                    </p>
                  </div>

                  <div className="mt-auto space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                      </span>
                      <span className="font-semibold text-slate-700">
                        {course.progress.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${course.progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl bg-slate-900 text-white hover:bg-blue-600"
                    onClick={() => {
                      const lessonId = course.progress.resumeLessonId
                      router.push(
                        lessonId
                          ? `/student/courses/${course.courseId}/play/${lessonId}`
                          : `/student/courses/${course.courseId}`
                      )
                    }}
                  >
                    {course.progress.completedLessons > 0 ? 'Resume' : 'Start learning'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
=======
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useUser } from "@clerk/nextjs"

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string | null
  description: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])

  const { user, isLoaded } = useUser()

  const [questionnaireCompleted, setQuestionnaireCompleted] =
    useState(false)

  const loadEnrolledCourses = async (userId: string) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        course_id,
        courses (
          id,
          title,
          price,
          thumbnail_url,
          description
        )
      `)
      .eq('student_id', userId)

    if (error) {
      console.error('Enroll fetch error', error)
      return
    }

    const courses = data
      ?.map((row: any) => row.courses)
      .filter(Boolean)

    setEnrolledCourses(courses || [])
  }

  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !user) return

      // ✅ STEP 1: create user
      await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          name: user.fullName
        })
      })

      // ✅ STEP 2: direct fetch (NO RETRY, NO WAIT)
      const { data, error } = await supabase
  .from('profiles')
  .select('id')
  .eq('clerk_id', user.id)

if (error || !data || data.length === 0) {
  console.error("PROFILE ERROR:", error)
  setLoading(false)
  return
}

const uuid = data[0].id
console.log("UUID:", uuid)


// ✅ CHECK IF QUESTIONNAIRE COMPLETED
const { data: result } = await supabase
  .from('questionnaire_results')
  .select('id')
  .eq('user_id', user.id)
    .maybeSingle()

console.log("QUESTIONNAIRE RESULT:", result)

// ✅ SET STATE
setQuestionnaireCompleted(!!result)

// ✅ LOAD COURSES
await loadEnrolledCourses(uuid)

// ✅ STOP LOADING
setLoading(false)
    }

    init()
  }, [user, isLoaded])

  if (loading) return null

  return (
    <div className="min-h-screen px-10 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HERO */}
        <div className="rounded-2xl border bg-white px-10 py-10 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Student Dashboard
          </p>
          <h1 className="text-3xl font-semibold mt-3">
            Welcome to your learning dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Track progress and unlock your learning journey
          </p>
        </div>

        {/* ACTION REQUIRED */}
        {!questionnaireCompleted && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-blue-700">
                Action Required
              </h2>
              <p className="mt-2 text-slate-700 max-w-2xl">
                Complete the questionnaire to unlock courses,
                capstone projects, and learning features.
              </p>
            </div>

            <Link href="/student/questionnaire">
              <Button className="rounded-full px-10 bg-blue-600 hover:bg-blue-700 text-white">
                Complete Questionnaire
              </Button>
            </Link>
          </div>
        )}

        {/* SEARCH */}
        <Card className="rounded-2xl border bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search courses"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={!questionnaireCompleted}
                  className="pl-11"
                />
              </div>

              <select
                disabled={!questionnaireCompleted}
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="px-5 py-3 rounded-lg border bg-white text-slate-700"
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ENROLLED COURSES */}
        {questionnaireCompleted && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Your Enrolled Courses
            </h2>

            {enrolledCourses.length === 0 ? (
              <p className="text-slate-500">
                You have not enrolled in any courses yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                        No image
                      </div>
                    )}

                    <CardContent className="space-y-4 pt-4">
                      <h3 className="font-semibold text-lg">
                        {course.title}
                      </h3>

                      <Button
                        className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          router.push(`/student/courses/${course.id}`)
                        }
                      >
                        Go to Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOCKED */}
        {!questionnaireCompleted && (
          <Card className="rounded-2xl border border-dashed bg-white shadow-sm">
            <CardContent className="py-24 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>

              <h3 className="text-2xl font-semibold">
                Courses are locked
              </h3>

              <p className="text-slate-600 max-w-md mx-auto">
                Complete the questionnaire to unlock your
                personalized learning path.
              </p>

              <Link href="/student/questionnaire">
                <Button className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white">
                  Unlock Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
