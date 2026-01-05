//app/student/courses/[id]/page.tsx
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
import {
  ArrowLeft,
  ArrowRight,
  Play,
  BookOpen,
} from 'lucide-react'

/* =======================
   TYPES
======================= */
interface Lesson {
  id: string
  title: string
}

interface Course {
  id: string
  title: string
  description: string
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
      const { data: courseData, error: courseError } =
        await supabase
          .from('courses')
          .select(
            'id, title, description, price, thumbnail_url',
          )
          .eq('id', courseId)
          .single()

      if (courseError || !courseData) {
        console.error(courseError)
        setLoading(false)
        return
      }

      /* 2️⃣ Sections */
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('course_id', courseId)

      const sectionIds =
        sections?.map(s => s.id) || []

      /* 3️⃣ Lessons */
      let lessons: Lesson[] = []

      if (sectionIds.length > 0) {
        const { data: lessonData } =
          await supabase
            .from('lessons')
            .select('id, title')
            .in('section_id', sectionIds)
            .order('order_index', {
              ascending: true,
            })

        lessons = lessonData || []
      }

      /* 4️⃣ Capstone */
      const { data: capstoneData } = await supabase
        .from('capstone_projects')
        .select('id, title, description')
        .eq('course_id', courseId)
        .maybeSingle()

      setCourse({
        ...courseData,
        lessons,
      })
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
        <h1 className="text-2xl font-semibold">
          Course not found
        </h1>
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
      <div className="flex items-center justify-between">
        <Link href="/student/courses">
          <Button variant="outline" className="rounded-full px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <p className="text-sm text-foreground/70 hidden md:block">
          Course detail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          <div className="aspect-video rounded-2xl overflow-hidden border bg-black">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-20 h-20 text-primary/40" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {course.title}
            </h1>
            <p className="text-foreground/70 mt-2">
              {course.description}
            </p>
          </div>

          {/* Lessons */}
          {course.lessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  {course.lessons.length} lessons
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/play/${lesson.id}`}
                  >
                    <div className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted transition">
                      <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium">
                          Lesson {index + 1}: {lesson.title}
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ================= CAPSTONE ================= */}
          {capstone && (
            <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle>🚀 Capstone Project</CardTitle>
                <CardDescription>
                  Apply what you learned by building a real-world project
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="list-disc ml-5 text-sm text-foreground/70 space-y-1">
                  <li>Requirement Gathering</li>
                  <li>Requirement Clarification & Approval</li>
                  <li>System Design</li>
                  <li>Development</li>
                  <li>Testing</li>
                  <li>Deployment</li>
                  <li>Retrospective</li>
                </ul>

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
                {course.price === 0
                  ? 'Free'
                  : `₹${course.price}`}
              </CardTitle>
              <CardDescription>
                Lifetime access
              </CardDescription>
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

              <ul className="text-sm text-foreground/70 space-y-1">
                <li>✓ {course.lessons.length} lessons</li>
                <li>✓ Lifetime access</li>
                <li>✓ Certificate</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
