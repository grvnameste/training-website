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
import { ArrowLeft, BookOpen } from 'lucide-react'

/* ================= TYPES ================= */
interface Lesson {
  id: string
  title: string
}

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string | null
  lessons: Lesson[]
}


// interface Capstone {
//   id: string
//   title: string
//   description: string
// }

/* ================= PAGE ================= */
export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  // const [capstone, setCapstone] = useState<Capstone | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [lastLessonId, setLastLessonId] = useState<string | null>(null)

  
  const [capstoneCourse, setCapstoneCourse] = useState<{
    id: string
    title: string
  } | null>(null)
  



  const [capstoneCourse, setCapstoneCourse] = useState<{
    id: string
    title: string
  } | null>(null)
  



  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, price, thumbnail_url, is_capstone, parent_course_id')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setLoading(false)
        return
      }

// 🚫 Block direct access to capstone course detail
if (courseData.is_capstone && courseData.parent_course_id) {
  router.replace(`/student/courses/${courseData.parent_course_id}`)
  return
}

      const { data: capstone } = await supabase
  .from('courses')
  .select('id, title')
  .eq('parent_course_id', courseId)
  .eq('is_capstone', true)
  .maybeSingle()

setCapstoneCourse(capstone || null)


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

      // const { data: capstoneData } = await supabase
      //   .from('capstone_projects')
      //   .select('id, title, description')
      //   .eq('course_id', courseId)
      //   .maybeSingle()


        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('student_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle()
        
          setIsEnrolled(!!enrollment)
        
          // ✅ fetch last watched lesson
          if (enrollment) {
            const { data: progress } = await supabase
  .from('student_lesson_progress')
  .select('lesson_id')
  .eq('student_id', user.id)
  .eq('course_id', courseId)
  .maybeSingle()

setLastLessonId(progress?.lesson_id ?? null)

          }
        }
        

      setCourse({ ...courseData, lessons })
      // setCapstone(capstoneData || null)
      setLoading(false)
    }

    loadCourse()
  }, [courseId])

  
  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !course) return
  
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()
  
    await supabase.from('course_enrollments').upsert(
      {
        student_id: user.id,
        course_id: course.id,
        student_first_name: profile?.first_name ?? '',
        student_last_name: profile?.last_name ?? '',
        course_title: course.title,
      },
      { onConflict: 'student_id,course_id' }
    )
  
    if (capstoneCourse) {
      await supabase.from('course_enrollments').upsert(
        {
          student_id: user.id,
          course_id: capstoneCourse.id,
        },
        { onConflict: 'student_id,course_id' }
      )
    }
  
    // ✅ UI update ONLY here
    setIsEnrolled(true)
    router.refresh()
  }
  
  
  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  if (!course) return null

  const firstLesson = course.lessons[0]

  return (
    <div className="min-h-screen px-8 py-12 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* BACK */}
        <Link href="/student/courses">
          <Button variant="ghost" className="px-0 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* THUMBNAIL */}

            {/* {capstoneCourse && (
  <Card className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
    <CardHeader>
      <CardTitle className="text-blue-700">
        Capstone Project
      </CardTitle>
      <CardDescription>
        Apply everything you learned in this course
      </CardDescription>
    </CardHeader>

    <CardContent>
      <Link href={`/student/capstone/${capstoneCourse.id}/stage/1`}>
        <Button className="w-full rounded-full bg-blue-600 text-white">
          Start Capstone Project
        </Button>
      </Link>
    </CardContent>
  </Card>
)} */}


            <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt="Course thumbnail"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="flex items-center justify-center aspect-video bg-slate-100">
                  <BookOpen className="w-20 h-20 text-slate-300" />
                </div>
              )}
            </div>

            {/* CAPSTONE */}
            {/* {capstone && isEnrolled && (

              <Card className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-700">
                    Capstone Project
                  </CardTitle>
                  <CardDescription className="text-slate-700">
                    Build a real-world project following the complete SDLC
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Link href={`/student/courses/${courseId}/capstone`}>
                    <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                      Start Capstone Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )} */}
          </div>

          {/* RIGHT */}
          <div>
            <Card className="sticky top-24 rounded-2xl border bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-3xl text-blue-600">
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Lifetime access • Certificate included
                </CardDescription>
              </CardHeader>

              <CardContent>
  {!isEnrolled ? (
    <Button
      className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white"
      onClick={handleEnroll}
    >
      Enroll Now
    </Button>
  ) : lastLessonId ? (
    <Button
      className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() =>
        router.push(
          `/student/courses/${courseId}/play/${lastLessonId}`
        )
      }
    >
      Continue Course
    </Button>
  ) : firstLesson ? (
    <Button
      className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() =>
        router.push(
          `/student/courses/${courseId}/play/${firstLesson.id}`
        )
      }
    >
      Start Learning
    </Button>
  ) : null}
</CardContent>


            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
