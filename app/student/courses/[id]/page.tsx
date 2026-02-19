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
import { ArrowLeft, BookOpen, MessageSquare } from 'lucide-react'
import { ChatTrigger } from '@/components/ChatTrigger'
import { ChatModal } from '@/components/ChatModal'
import { usePresence } from '@/hooks/usePresence'

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
  teacher_id: string
  lessons: Lesson[]
}

/* ================= PAGE ================= */
export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [lastLessonId, setLastLessonId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Student')
  const [isChatOpen, setIsChatOpen] = useState(false)

  // 🛰️ Track Presence
  const { isUserOnline } = usePresence(userId, userName, courseId)

  // ✅ linked capstone (single source of truth)
  const [linkedCapstone, setLinkedCapstone] = useState<{
    id: string
    title: string
  } | null>(null)

  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, price, thumbnail_url, is_capstone, parent_course_id, teacher_id')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setLoading(false)
        return
      }

      // 🚫 block direct capstone access
      if (courseData.is_capstone && courseData.parent_course_id) {
        router.replace(`/student/courses/${courseData.parent_course_id}`)
        return
      }

      // 🔗 fetch linked capstone
      const { data: capstone } = await supabase
        .from('courses')
        .select('id, title')
        .eq('parent_course_id', courseId)
        .eq('is_capstone', true)
        .maybeSingle()

      setLinkedCapstone(capstone || null)

      // 📚 lessons
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

      // 👤 enrollment + progress
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('full_name, name').eq('id', user.id).maybeSingle()
        setUserName(profile?.full_name || profile?.name || user.email?.split('@')[0] || 'Student')

        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()

        setIsEnrolled(!!enrollment)

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
      setLoading(false)
    }

    loadCourse()
  }, [courseId, router])

  /* ================= ENROLL ================= */
  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !course) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // enroll main course
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

    // auto-enroll linked capstone
    if (linkedCapstone) {
      await supabase.from('course_enrollments').upsert(
        {
          student_id: user.id,
          course_id: linkedCapstone.id,
        },
        { onConflict: 'student_id,course_id' }
      )
    }

    setIsEnrolled(true)
    router.refresh()
  }

  /* ================= UI ================= */
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

        <Link href="/student/courses">
          <Button variant="ghost" className="px-0 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
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
                      router.push(`/student/courses/${courseId}/play/${lastLessonId}`)
                    }
                  >
                    Continue Course
                  </Button>
                ) : firstLesson ? (
                  <Button
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() =>
                      router.push(`/student/courses/${courseId}/play/${firstLesson.id}`)
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

      {/* 💬 Floating Chat Button */}
      {isEnrolled && userId && course && (
        <>
          <Button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 group border-4 border-white"
            size="icon"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-white" />
              {isUserOnline(course.teacher_id) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            
            <span className="absolute right-16 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider shadow-lg">
              Support Chat
            </span>
          </Button>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            studentId={userId}
            teacherId={course.teacher_id}
            courseId={courseId}
            courseTitle={course.title}
          />
        </>
      )}
    </div>
  )
}
