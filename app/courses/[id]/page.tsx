'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'

type Course = {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  thumbnail_url: string
}

type Lesson = {
    id: string
    title: string
    description: string
    duration: string
  }
  
  type Section = {
    id: string
    title: string
    lessons: Lesson[]
  }
  

export default function CoursePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    const { data: courseData, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        subtitle,
        description,
        price,
        thumbnail_url
      `)
      .eq('id', id)
      .single()
  
    if (error || !courseData) {
      setLoading(false)
      return
    }
  
    setCourse(courseData) // ✅ THIS WAS MISSING
  
    const { data: sectionsData } = await supabase
      .from('sections')
      .select(`
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          description,
          duration
        )
      `)
      .eq('course_id', id)
      .order('order_index', { ascending: true })
  
    setSections(sectionsData || [])
    setLoading(false)
  }
  

  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500">
        Loading course...
      </p>
    )
  }

  if (!course) {
    return (
      <p className="py-20 text-center text-red-500">
        Course not found
      </p>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-64 w-full">
  <Image
    src={course.thumbnail_url}
    alt={course.title}
    fill
    className="object-cover"
  />

  {/* Back to Courses (overlay) */}
  <div className="absolute top-4 left-4">
    <Link href="/courses">
      <Button
        variant="secondary"
        className="bg-white/90 backdrop-blur hover:bg-white"
      >
        ← Back to Courses
      </Button>
    </Link>
  </div>
</div>


      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 lg:grid-cols-3">
     

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {course.title}
            </h1>
            <p className="mt-2 text-slate-600">
              {course.subtitle}
            </p>
          </div>

          <p className="text-slate-700">
            {course.description}
          </p>

          {/* Lessons */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Course Content
            </h2>

            <div className="space-y-6">
  {sections.map((section, sectionIndex) => (
    <div key={section.id}>
      {/* Section title */}
      <h3 className="mb-3 text-lg font-semibold">
        {sectionIndex + 1}. {section.title}
      </h3>

      <div className="space-y-2">
        {section.lessons.map((lesson, lessonIndex) => (
          <Card key={lesson.id}>
            <CardContent className="flex justify-between py-3">
              <div>
                <p className="font-medium">
                  {lessonIndex + 1}. {lesson.title}
                </p>
                <p className="text-sm text-slate-500">
                  {lesson.description}
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Locked
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ))}
</div>

          </div>
        </div>

        {/* RIGHT */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle>
              {course.price === 0
                ? 'Free Course'
                : `₹${course.price}`}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
          <Link href="/login">
  <Button className="w-full">
    Login to Enroll
  </Button>
</Link>

            <p className="text-xs text-slate-500 text-center">
              Preview lessons available
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
