<<<<<<< HEAD
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Search,
} from 'lucide-react'

type CatalogCourse = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  price: number
  thumbnailUrl: string | null
  level: string
  estimatedMinutes: number | null
  outcomes: string[]
  tags: string[]
  certificateEnabled: boolean
}

type EnrolledCourse = {
  courseId: string
  progress: {
    percentage: number
    completedLessons: number
    totalLessons: number
    resumeLessonId: string | null
  }
}

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'] as const
const PRICES = [
  { value: 'all', label: 'All prices' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
] as const

export default function CoursesListPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<CatalogCourse[]>([])
  const [enrolled, setEnrolled] = useState<Record<string, EnrolledCourse>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all')
  const [price, setPrice] = useState<'all' | 'free' | 'paid'>('all')
  const [topic, setTopic] = useState('')

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search.trim()) params.set('q', search.trim())
        if (level !== 'all') params.set('level', level)
        if (price !== 'all') params.set('price', price)
        if (topic.trim()) params.set('topic', topic.trim())

        const [catalogRes, enrolledRes] = await Promise.all([
          fetch(`/api/catalog/courses?${params.toString()}`, {
            cache: 'no-store',
            signal: controller.signal,
          }),
          fetch('/api/me/courses', { cache: 'no-store', signal: controller.signal }),
        ])

        const catalogData = await catalogRes.json().catch(() => ({}))
        const enrolledData = await enrolledRes.json().catch(() => ({}))

        if (!active) return
        setCourses(catalogData.courses ?? [])
        const map: Record<string, EnrolledCourse> = {}
        for (const item of enrolledData.courses ?? []) {
          map[item.courseId] = item
        }
        setEnrolled(map)
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Catalog load failed:', error)
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 250)

    return () => {
      active = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [search, level, price, topic])

  const topics = useMemo(() => {
    const set = new Set<string>()
    for (const course of courses) {
      for (const tag of course.tags ?? []) set.add(tag)
    }
    return [...set].slice(0, 12)
  }, [courses])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Catalog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Explore courses
          </h1>
          <p className="text-sm text-slate-600">
            Choose an outcome-led path and build practical skills.
          </p>
        </div>
        <Link href="/student/my-courses">
          <Button variant="outline" className="rounded-full">
            <BookOpen className="mr-2 h-4 w-4" /> My learning
          </Button>
        </Link>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, outcome, or technology…"
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                level === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {value === 'all' ? 'All levels' : value}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-slate-200" />
          {PRICES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPrice(option.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                price === option.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {topics.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTopic(topic === tag ? '' : tag)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  topic === tag
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No courses match these filters yet.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch('')
              setLevel('all')
              setPrice('all')
              setTopic('')
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const enrollment = enrolled[course.id]
            const progress = enrollment?.progress
            return (
              <Card
                key={course.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href={`/student/courses/${course.id}`} className="block">
                  <div className="relative h-44 w-full bg-slate-100">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    {enrollment && (
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Enrolled
                      </span>
                    )}
                  </div>
                </Link>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">
                      {course.level}
                    </span>
                    {course.estimatedMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{' '}
                        {course.estimatedMinutes < 60
                          ? `${course.estimatedMinutes}m`
                          : `${Math.round(course.estimatedMinutes / 60)}h`}
                      </span>
                    )}
                    {course.certificateEnabled && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Certificate
                      </span>
                    )}
                  </div>

                  <Link href={`/student/courses/${course.id}`}>
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 hover:text-blue-600">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {course.subtitle || course.description}
                  </p>

                  {progress && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>
                          {progress.completedLessons}/{progress.totalLessons} lessons
                        </span>
                        <span className="font-semibold text-slate-700">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-semibold text-slate-900">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-full bg-slate-900 text-white hover:bg-blue-600"
                      onClick={() => {
                        if (enrollment?.progress.resumeLessonId) {
                          router.push(
                            `/student/courses/${course.id}/play/${enrollment.progress.resumeLessonId}`
                          )
                        } else {
                          router.push(`/student/courses/${course.id}`)
                        }
                      }}
                    >
                      {enrollment ? 'Continue' : 'View course'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
=======
//app/student/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { useUser } from "@clerk/nextjs"

interface Course {
  id: string
  title: string
  price: number
  description: string
  thumbnail_url: string | null
}

export default function CoursesListPage() {
  const { user } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
const [firstLessons, setFirstLessons] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      const { data } = await supabase
      .from('courses')
      .select('id, title, price, description, thumbnail_url')
      .eq('is_capstone', false)
      .order('created_at', { ascending: false })
      
      setCourses(data || [])

      if (user) {
        // 🔥 Clerk → UUID
        const { data: uuid } = await supabase.rpc('clerk_to_uuid', {
          clerk_id: user.id
        })
      
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('student_id', uuid)

  const enrolledIds = (enrollments || []).map(e => e.course_id)
  setEnrolledCourses(enrolledIds)

  // 🔥 get first lesson for each course
  const lessonMap: Record<string, string> = {}

  for (const enrolledCourseId of enrolledIds) {
    const { data: sections } = await supabase
      .from('sections')
      .select(`
        id,
        lessons (
          id,
          order_index
        )
      `)
      .eq('course_id', enrolledCourseId)
            .order('order_index', { ascending: true })

    const firstLesson = sections?.[0]?.lessons?.[0]?.id
    if (firstLesson) {
      lessonMap[enrolledCourseId] = firstLesson    }
  }

  setFirstLessons(lessonMap)
}
      setLoading(false)
    }

    loadCourses()
  }, [])
// console.log("courses",courses);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading courses…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <div className="rounded-2xl border bg-white px-10 py-8 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Courses
          </p>
          <h1 className="text-3xl font-semibold mt-2">
            Explore All Courses
          </h1>
          <p className="text-slate-600 mt-1">
            Browse learning paths and start building real skills
          </p>
        </div>

        {/* ================= COURSES GRID ================= */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="block h-full"
            >
              <Card className="group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* THUMBNAIL */}
                  <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <GraduationCap className="w-14 h-14 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="font-semibold text-blue-600">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                      {enrolledCourses.includes(course.id) ? (
  <button
    onClick={(e) => {
      e.preventDefault()
      const lessonId = firstLessons[course.id]
      if (lessonId) {
        window.location.href = `/student/courses/${course.id}/play/${lessonId}`
      }
    }}
    className="text-xs text-green-600 font-semibold"
  >
    Continue Learning →
  </button>
) : (
  <span className="text-xs text-slate-400">
    View details →
  </span>
)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
