'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Lock,
  PlayCircle,
} from 'lucide-react'

type Lesson = { id: string; title: string; duration: string | null; isPreview: boolean }
type Section = { id: string; title: string; lessons: Lesson[] }
type Course = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  price: number
  thumbnailUrl: string | null
  level: string
  estimatedMinutes: number | null
  outcomes: string[]
  prerequisites: string[]
  tags: string[]
  whatYouBuild: string | null
  certificateEnabled: boolean
  sections: Section[]
  instructor: { id: string; name: string; avatar: string | null } | null
  previewLessonId: string | null
}

export default function CoursePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let active = true
    fetch(`/api/catalog/courses/${id}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok && active) setCourse(data.course)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Course not found</h2>
        <Link href="/courses">
          <Button variant="outline">Browse all courses</Button>
        </Link>
      </div>
    )
  }

  const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0)
  const enrollHref = user ? `/student/courses/${course.id}` : `/login?redirect_url=/student/courses/${course.id}`

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative h-[400px] w-full overflow-hidden bg-slate-900">
        <Image
          src={course.thumbnailUrl || '/default-course.png'}
          alt={course.title}
          fill
          referrerPolicy="no-referrer"
          className="object-cover opacity-40 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-12">
          <Link href="/courses" className="absolute left-6 top-8 group">
            <div className="flex items-center gap-2 text-slate-300 transition-colors group-hover:text-white">
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back to catalog</span>
            </div>
          </Link>
          <div className="max-w-3xl space-y-4">
            <span className="inline-block rounded-full border border-blue-500/30 bg-blue-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
              {course.price === 0 ? 'Free course' : 'Premium course'}
            </span>
            <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
              {course.title}
            </h1>
            <p className="line-clamp-2 max-w-2xl text-lg text-slate-300">{course.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 grid max-w-6xl gap-10 px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">About this course</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">
              {course.description}
            </p>
            {course.outcomes.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  What you will learn
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <BookOpen className="text-blue-600" /> Course curriculum
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {course.sections.length} sections • {totalLessons} lessons
              </span>
            </div>

            <div className="space-y-4">
              {course.sections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <h3 className="mb-3 px-2 text-sm font-bold uppercase tracking-widest text-slate-400">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <PlayCircle size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                              <Clock size={12} /> {lesson.duration || 'Self-paced'}
                            </span>
                          </div>
                        </div>
                        {lesson.isPreview ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                            Preview
                          </span>
                        ) : (
                          <Lock size={16} className="text-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60">
            <p className="text-sm font-medium text-slate-400">Total investment</p>
            <h3 className="mt-1 text-4xl font-black text-slate-900">
              {course.price === 0 ? <span className="text-emerald-600">FREE</span> : `₹${course.price}`}
            </h3>

            <div className="mt-6 space-y-3">
              <Link href={enrollHref} className="block w-full">
                <Button className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-700">
                  {user ? 'Open course' : 'Sign in to enroll'}
                </Button>
              </Link>
              {course.price > 0 && (
                <Link href="/contact" className="block w-full">
                  <Button variant="outline" className="h-12 w-full rounded-2xl">
                    Contact institute
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                This course includes
              </p>
              <SimpleItem icon={<BookOpen size={18} />} text={`${totalLessons} structured lessons`} />
              <SimpleItem icon={<Clock size={18} />} text="Self-paced learning" />
              {course.certificateEnabled && (
                <SimpleItem icon={<CheckCircle2 size={18} />} text="Certificate on completion" />
              )}
            </div>

            {course.instructor && (
              <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                Instructor: <span className="font-semibold text-slate-800">{course.instructor.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SimpleItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <span className="text-blue-500">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
