<<<<<<< HEAD
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
=======
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ArrowRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  thumbnail: string
  description: string
}

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem('lms_current_user') || '{}',
    )
    const allCourses = JSON.parse(
      localStorage.getItem('lms_courses') || '[]',
    )
    const enrollmentIds = JSON.parse(
      localStorage.getItem(`enrollments_${currentUser.email}`) || '[]',
    )

    const enrolled = allCourses.filter((c: Course) =>
      enrollmentIds.includes(c.id),
    )
    setEnrolledCourses(enrolled)
  }, [])

  return (
    <div className="space-y-8">
      {/* Header / Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          My Courses
        </h1>
        <p className="text-sm md:text-base text-foreground/70">
          Continue learning from where you left off
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-border/70 rounded-3xl">
          <CardContent className="pt-12 pb-12 text-center max-w-xl mx-auto space-y-4">
            <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-2" />
            <h3 className="text-xl font-semibold text-foreground">
              You haven't enrolled in any courses yet
            </h3>
            <p className="text-sm md:text-base text-foreground/70">
              Start exploring and enroll in courses to begin your learning
              journey
            </p>
            <Link href="/student/dashboard">
              <Button className="bg-primary hover:bg-primary/90 rounded-full mt-2">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 border border-border/70 transition-all cursor-pointer rounded-2xl flex flex-col h-full">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-primary/5 relative overflow-hidden">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                </div>

                <CardContent className="pt-4 pb-4 px-4 md:px-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full w-1/3" />
                    </div>
                    <p className="text-[11px] md:text-xs text-foreground/60">
                      33% Complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
