//app/student/courses/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useUser } from "@clerk/nextjs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, BookOpen, MessageCircle } from 'lucide-react'
import { ChatModal } from '@/components/ChatModal'
import { usePresence } from '@/hooks/usePresence'
import { useUnreadCount } from '@/hooks/useUnreadCount'

interface Lesson {
  id: string
  title: string
  order_index: number
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string | null
  teacher_id: string
  sections: Section[]
}

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

  const { isUserOnline } = usePresence(userId, userName, courseId)
  const unreadCount = useUnreadCount(userId, courseId)
  const [hasCapstone, setHasCapstone] = useState(false)



  const { user } = useUser()



  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, price, thumbnail_url, teacher_id')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setLoading(false)
        return
      }

      const { data: sectionsData } = await supabase
        .from('sections')
        .select(`
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index
          )
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

        if (user) {
          // 🔥 STEP 1: clerk_id se UUID lao
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("clerk_id", user.id)
            .single()
        
          if (!profile) return
        
          const uuid = profile.id
          setUserId(uuid)
        
          // 🔥 STEP 2: enrollment check
          const { data: enrollment } = await supabase
            .from("course_enrollments")
            .select("id")
            .eq("student_id", uuid)
            .eq("course_id", courseId)
            .maybeSingle()
        
          setIsEnrolled(!!enrollment)
        
          // 🔥 STEP 3: progress check
          if (enrollment) {
            const { data: progress } = await supabase
              .from("student_lesson_progress")
              .select("lesson_id")
              .eq("student_id", uuid)
              .eq("course_id", courseId)
              .maybeSingle()
        
            setLastLessonId(progress?.lesson_id ?? null)
          }
        }
      // 🔥 Check capstone (parent_course_id match)
const { data: capstoneData } = await supabase
.from('courses')
.select('id')
.eq('parent_course_id', courseId)
.eq('is_capstone', true)

setHasCapstone((capstoneData || []).length > 0)

      setCourse({ ...courseData, sections: sectionsData || [] })
      setLoading(false)
    }
   
    loadCourse()
  }, [courseId])

  

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  if (!course) return null

  const firstLesson = course?.sections?.[0]?.lessons?.[0]

  return (
    <div className="min-h-screen px-8 py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-10">

      <Button
  variant="ghost"
  onClick={() => router.push('/student/courses')}
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back to Courses
</Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* 🔥 ACCORDION */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">              
            <div className="px-6 py-4 border-b">
                              <h2 className="text-xl font-bold">Syllabus</h2>
                              <p className="text-sm text-gray-500">                  {course.sections.length} Sections •{" "}
                  {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Lessons
                </p>
              </div>

              <div className="divide-y divide-gray-800">
                {course.sections.map((section, idx) => (
                  <details key={section.id} open={idx === 0} className="group">                    
                    <summary className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-100">
  
  <div className="flex items-center gap-4">
    
    {/* Section Number */}
    <span className="text-gray-400 font-mono text-sm">
      {String(idx + 1).padStart(2, "0")}
    </span>

    {/* Title + Lesson Count */}
    <div>
      <p className="font-semibold text-gray-800">
        {section.title}
      </p>
      <p className="text-xs text-gray-500">
        {section.lessons.length} lessons
      </p>
    </div>

  </div>

  {/* Arrow */}
  <span className="text-gray-400 group-open:rotate-180 transition">
    ⌄
  </span>

</summary>

                    <div className="px-6 pb-4">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} 
                        className="flex items-center justify-between py-3 text-sm text-gray-700 border-b last:border-0">
                          <span>▶ {lesson.title}</span>
                          <span className="text-xs text-gray-500">Video</span>
                        </div>
                      ))}
                    </div>

                  </details>
                ))}
              </div>
            </div>

            {/* Thumbnail */}
           

          </div>

          {/* RIGHT */}
          <div>
        
          <Card className="sticky top-24 overflow-hidden">

  {/* 🔥 THUMBNAIL INSIDE CARD */}
  <div className="aspect-video w-full">
    {course.thumbnail_url ? (
      <img
        src={course.thumbnail_url}
        alt="Course Thumbnail"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <BookOpen />
      </div>
    )}
  </div>

  <CardHeader>
    <CardTitle>
      {course.price === 0 ? 'Free' : `₹${course.price}`}
    </CardTitle>
 
  </CardHeader>

  <CardContent className="space-y-6">

{/* Validity */}
<div className="flex items-center gap-2 text-sm text-gray-600">
  <span>⏱</span>
  <span>Lifetime access</span>
</div>

{/* Button */}
{!isEnrolled ? (
  <Button
    onClick={() =>
      router.push(`/student/courses/${courseId}/checkout/details`)
    }
    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold rounded-lg"
  >
    {course.price === 0 ? 'Enroll Now' : 'Buy Now'}
  </Button>
) : firstLesson ? (
  <Button
    className="w-full py-6 text-lg rounded-lg"
    onClick={() =>
      router.push(`/student/courses/${courseId}/play/${firstLesson.id}`)
    }
  >
    Continue Learning
  </Button>
) : null}

{/* Divider */}
<div className="border-t pt-4 space-y-3">

  <h3 className="font-semibold text-lg text-gray-800">
    What's included
  </h3>

  <ul className="space-y-3 text-sm text-gray-600">

    {/* Lessons */}
    <li className="flex items-center gap-3">
      <span>➕</span>
      <span>
        {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
      </span>
    </li>

    {/* Capstone */}
    {hasCapstone && (
      <li className="flex items-center gap-3">
        <span>🚀</span>
        <span>Capstone Project</span>
      </li>
    )}

  </ul>
</div>

</CardContent>

</Card>
          </div>

        </div>
      </div>

      {/* CHAT */}
      {isEnrolled && userId && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          studentId={userId}
          teacherId={course.teacher_id}
          courseId={courseId}
          courseTitle={course.title}
        />
      )}
    </div>
  )
}