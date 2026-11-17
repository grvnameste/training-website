'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react'

type Course = {
  courseId: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  price: string | null
  progress: {
    percentage: number
    completedLessons: number
    totalLessons: number
    resumeLessonId: string | null
  }
}

export default function MyCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/me/courses', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Could not load your courses')
        return data.courses as Course[]
      })
      .then((items) => {
        if (active) setCourses(items ?? [])
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'Could not load your courses')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            My learning
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Enrolled courses
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Continue where you left off. Progress reflects completed lessons only.
          </p>
        </div>
        <Link href="/student/courses">
          <Button variant="outline" className="rounded-full">
            Browse catalog
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {error}
        </Card>
      ) : courses.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">No courses yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enroll in a free course or ask your institute to grant access.
          </p>
          <Link href="/student/courses">
            <Button className="mt-5 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              Explore courses
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.courseId}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
                <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                  {course.title}
                </h2>
                <p className="line-clamp-2 text-sm text-slate-500">
                  {course.description || 'Structured lessons with practical progress tracking.'}
                </p>

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
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${course.progress.percentage}%` }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl bg-slate-900 text-white hover:bg-blue-600"
                  onClick={() =>
                    router.push(
                      course.progress.resumeLessonId
                        ? `/student/courses/${course.courseId}/play/${course.progress.resumeLessonId}`
                        : `/student/courses/${course.courseId}`
                    )
                  }
                >
                  {course.progress.completedLessons > 0 ? 'Resume learning' : 'Start learning'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
