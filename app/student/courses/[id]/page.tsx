// app/student/courses/[id]/page.tsx
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

/* =======================
   TYPES
======================= */
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

/* =======================
   PAGE
======================= */
export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [capstone, setCapstone] = useState<Capstone | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      /* 1️⃣ Course */
      const { data: courseData, error } = await supabase
        .from('courses')
        .select('id, price, thumbnail_url')
        .eq('id', courseId)
        .single()

      if (error || !courseData) {
        setLoading(false)
        return
      }

      /* 2️⃣ Sections */
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('course_id', courseId)

      const sectionIds = sections?.map(s => s.id) || []

      /* 3️⃣ Lessons */
      let lessons: Lesson[] = []

      if (sectionIds.length > 0) {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id, title')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        lessons = lessonData || []
      }

      /* 4️⃣ Capstone */
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
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-foreground/70">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p>Loading course...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Course not found</h1>
        <Link href="/student/courses">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>
    )
  }

  const firstLesson = course.lessons[0]

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div>
        <Link href="/student/courses">
          <Button variant="outline" className="rounded-full px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail only */}
          <div className="aspect-video rounded-2xl overflow-hidden border bg-black">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt="Course thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-20 h-20 text-primary/40" />
              </div>
            )}
          </div>

          {/* CAPSTONE */}
          {capstone && (
            <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle>🚀 Capstone Project</CardTitle>
                <CardDescription>
                  Real-world project based learning
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Link href={`/student/courses/${courseId}/capstone`}>
                  <Button className="w-full">
                    Start Capstone Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </CardTitle>
              <CardDescription>Lifetime access</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {firstLesson && (
                <Button
                  className="w-full rounded-xl"
                  onClick={() =>
                    router.push(
                      `/student/courses/${courseId}/play/${firstLesson.id}`,
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
  )
}
