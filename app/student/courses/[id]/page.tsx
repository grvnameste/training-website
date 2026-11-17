'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Lock,
  MessageCircle,
  PlayCircle,
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'

type Lesson = {
  id: string
  title: string
  summary: string | null
  duration: string | null
  isPreview: boolean
}

type Section = {
  id: string
  title: string
  lessons: Lesson[]
}

type Course = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  price: number
  thumbnailUrl: string | null
  teacherId: string | null
  level: string
  estimatedMinutes: number | null
  outcomes: string[]
  prerequisites: string[]
  tags: string[]
  whatYouBuild: string | null
  certificateEnabled: boolean
  sections: Section[]
  instructor: { id: string; name: string; avatar: string | null } | null
}

type Enrollment = {
  courseId: string
  progress: {
    percentage: number
    resumeLessonId: string | null
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const { user, isLoaded } = useUser()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const courseRes = await fetch(`/api/catalog/courses/${courseId}`, { cache: 'no-store' })
      const courseData = await courseRes.json().catch(() => ({}))
      if (!courseRes.ok) throw new Error(courseData?.error || 'Course not found')
      setCourse(courseData.course)

      if (user) {
        const enrolledRes = await fetch('/api/me/courses', { cache: 'no-store' })
        if (enrolledRes.ok) {
          const enrolledData = await enrolledRes.json()
          const match = (enrolledData.courses ?? []).find(
            (item: Enrollment) => item.courseId === courseId
          )
          setEnrollment(match ?? null)
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Course not found')
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    if (!isLoaded) return
    void load()
  }, [isLoaded, load])

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect_url=/student/courses/${courseId}`)
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not enroll')
      if (data.firstLessonId) {
        router.push(`/student/courses/${courseId}/play/${data.firstLessonId}`)
      } else {
        await load()
      }
    } catch (err: any) {
      setError(err?.message || 'Could not enroll')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-slate-500">{error || 'Course not found'}</p>
        <Link href="/student/courses">
          <Button variant="outline" className="mt-4">
            Back to catalog
          </Button>
        </Link>
      </div>
    )
  }

  const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0)
  const firstPreview = course.sections
    .flatMap((section) => section.lessons)
    .find((lesson) => lesson.isPreview)
  const resumeLessonId = enrollment?.progress.resumeLessonId ?? firstPreview?.id ?? null
  const isEnrolled = Boolean(enrollment)

  return (
    <div className="space-y-8">
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-56 w-full bg-slate-100">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <GraduationCap className="h-14 w-14 text-slate-300" />
                </div>
              )}
            </div>
            <div className="space-y-3 p-6">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize">{course.level}</span>
                {course.estimatedMinutes && (
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                    <Clock className="h-3 w-3" />{' '}
                    {course.estimatedMinutes < 60
                      ? `${course.estimatedMinutes}m`
                      : `${Math.round(course.estimatedMinutes / 60)}h`}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{totalLessons} lessons</span>
                {course.certificateEnabled && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    Certificate
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {course.title}
              </h1>
              {course.subtitle && <p className="text-lg text-slate-600">{course.subtitle}</p>}
              {course.description && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {course.description}
                </p>
              )}
              {course.instructor && (
                <p className="text-sm text-slate-500">
                  Instructor: <span className="font-medium text-slate-800">{course.instructor.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title="What you will learn" items={course.outcomes} />
            <InfoList title="Prerequisites" items={course.prerequisites} />
          </div>

          {course.whatYouBuild && (
            <Card className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
                What you will build
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-blue-950">{course.whatYouBuild}</p>
            </Card>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Curriculum</h2>
              <p className="text-xs text-slate-500">
                {course.sections.length} sections · {totalLessons} lessons
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {course.sections.map((section, index) => (
                <div key={section.id} className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Section {index + 1}
                  </p>
                  <h3 className="mt-1 font-medium text-slate-900">{section.title}</h3>
                  <div className="mt-3 space-y-1">
                    {section.lessons.map((lesson) => {
                      const canOpen = isEnrolled || lesson.isPreview
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          disabled={!canOpen}
                          onClick={() =>
                            canOpen &&
                            router.push(`/student/courses/${courseId}/play/${lesson.id}`)
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                            canOpen
                              ? 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                              : 'cursor-default text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {canOpen ? (
                              <PlayCircle className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-300" />
                            )}
                            {lesson.title}
                          </span>
                          <span className="flex items-center gap-2 text-xs">
                            {lesson.isPreview && (
                              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700">
                                Preview
                              </span>
                            )}
                            {lesson.duration && <span>{lesson.duration}</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-20">
          <Card className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Total price</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </p>

            <div className="mt-5 space-y-2">
              {isEnrolled ? (
                <Button
                  className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() =>
                    resumeLessonId
                      ? router.push(`/student/courses/${courseId}/play/${resumeLessonId}`)
                      : router.push('/student/my-courses')
                  }
                >
                  {resumeLessonId ? 'Continue learning' : 'View my courses'}
                </Button>
              ) : course.price === 0 ? (
                <Button
                  className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Enroll for free'
                  )}
                </Button>
              ) : (
                <Link href="/contact">
                  <Button className="h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                    <MessageCircle className="mr-2 h-4 w-4" /> Contact institute
                  </Button>
                </Link>
              )}

              {firstPreview && !isEnrolled && (
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={() =>
                    router.push(`/student/courses/${courseId}/play/${firstPreview.id}`)
                  }
                >
                  Watch preview lesson
                </Button>
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" /> {totalLessons} structured lessons
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> Learn at your own pace
              </p>
              {course.certificateEnabled && (
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Certificate on completion
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-400">No items listed yet.</p>
      )}
    </Card>
  )
}
