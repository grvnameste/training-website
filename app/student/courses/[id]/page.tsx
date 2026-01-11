'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, BookOpen } from 'lucide-react'

/* ================= TYPES ================= */
interface Lesson {
  id: string
  title: string
}

interface Course {
  id: string
  price: number
  thumbnail_url: string | null
  lessons: Lesson[]
}

interface Capstone {
  id: string
  title: string
  description: string
}

/* ================= PAGE ================= */
export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [capstone, setCapstone] = useState<Capstone | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, price, thumbnail_url')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setLoading(false)
        return
      }

      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('course_id', courseId)

      const sectionIds = sections?.map(s => s.id) || []

      let lessons: Lesson[] = []

      if (sectionIds.length > 0) {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id, title')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        lessons = lessonData || []
      }

      const { data: capstoneData } = await supabase
        .from('capstone_projects')
        .select('id, title, description')
        .eq('course_id', courseId)
        .maybeSingle()

      setCourse({ ...courseData, lessons })
      setCapstone(capstoneData || null)
      setLoading(false)
    }

    loadCourse()
  }, [courseId])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-teal-400/40 border-t-teal-400 animate-spin" />
      </div>
    )
  }

  if (!course) return null

  const firstLesson = course.lessons[0]

  return (
    <div className="relative min-h-screen px-8 py-12 text-white">

      {/* GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 bg-teal-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 bg-cyan-400/20 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto space-y-10">

        {/* BACK */}
        <Link href="/student/courses">
          <Button variant="ghost" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* THUMBNAIL */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt="Course thumbnail"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="flex items-center justify-center aspect-video bg-black/40">
                  <BookOpen className="w-20 h-20 text-white/30" />
                </div>
              )}
            </div>

            {/* CAPSTONE */}
            {capstone && (
              <Card className="rounded-3xl border border-teal-400/40 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 backdrop-blur shadow-xl">
                <CardHeader>
                  <CardTitle className="text-teal-300">
                    🚀 Capstone Project
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Build a real-world project following complete SDLC
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Link href={`/student/courses/${courseId}/capstone`}>
                    <Button className="w-full rounded-full bg-teal-400 text-black hover:bg-teal-300">
                      Start Capstone Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT */}
          <div>
            <Card className="sticky top-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl text-teal-300">
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </CardTitle>
                <CardDescription className="text-white/60">
                  Lifetime access • Certificate included
                </CardDescription>
              </CardHeader>

              <CardContent>
                {firstLesson && (
                  <Button
                    className="w-full rounded-full bg-teal-400 text-black hover:bg-teal-300"
                    onClick={() =>
                      router.push(
                        `/student/courses/${courseId}/play/${firstLesson.id}`
                      )
                    }
                  >
                    Start Learning
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
