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
const EARLY_ACCESS_COURSE_ID = 'a54443c0-533e-435c-8a2f-ad89f9e07c95'
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
{/* RIGHT */}
<div className="lg:col-span-1">

  {course.id === EARLY_ACCESS_COURSE_ID ? (

    // 🔥 EARLY ACCESS CARD
    <Card className="h-fit sticky top-24 bg-transparent shadow-none border-none">
      <CardContent className="p-6">

        <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-indigo-100 p-7 space-y-5 shadow-lg">

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-2xl opacity-40 pointer-events-none"></div>

          <div className="relative flex justify-center">
            <span className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-1 text-xs font-semibold text-white shadow-md animate-pulse">
              🚀 Coming Soon
            </span>
          </div>

          <h3 className="relative text-lg font-semibold text-center text-slate-800">
            Early Access Launch
          </h3>

          <p className="relative text-sm text-slate-600 text-center leading-relaxed">
            Be the first to access this course before public release.
            Limited early spots available!
          </p>

          <a
            href="https://forms.gle/7pBGSViM7N6wk2RX7"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block"
          >
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              Get Early Access
            </Button>
          </a>

          <div className="relative h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          <p className="relative text-xs text-slate-500 text-center">
            📩 We'll notify you when the course goes live
          </p>

        </div>

      </CardContent>
    </Card>

  ) : (

    // ✅ NORMAL COURSES CARD
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <CardTitle>
          {course.price === 0 ? 'Free Course' : `₹${course.price}`}
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

  )}

</div>
      </div>
    </div>
  )
}
