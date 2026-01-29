//app/student/courses/[id]/play/[videoId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Video from 'next-video'
import getStarted from '@/videos/get-started.mp4.json'
import Instaplay from 'player.style/instaplay/react'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

// interface Capstone {
//   id: string
//   title: string
//   description: string
// }


export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()

  const courseId = params.id as string
  const videoId = params.videoId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  // const [capstone, setCapstone] = useState<Capstone | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [capstoneCourse, setCapstoneCourse] = useState<{
    id: string
    title: string
  } | null>(null)
  
  
  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
  .from('courses')
  .select('id, title, is_capstone')
  .eq('id', courseId)
  .single()

if (!courseData) {
  setLoading(false)
  return
}

// 🔐 BLOCK capstone from video player
if (courseData.is_capstone) {
  router.replace('/student/courses')
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
          .select('id, title, description, video_url')
          .in('section_id', sectionIds)
          .order('order_index', { ascending: true })

        lessons = lessonData || []
      }

      const index = lessons.findIndex(l => l.id === videoId)



// ================= CAPSTONE FETCH =================
let capstoneData = null

if (!courseData.is_capstone) {
  const { data } = await supabase
    .from('courses')
    .select('id, title')
    .eq('parent_course_id', courseId)
    .eq('is_capstone', true)
    .maybeSingle()

  capstoneData = data
}

setCapstoneCourse(capstoneData)





   
      
// ================= ENROLLMENT CHECK =================
const { data: { user } } = await supabase.auth.getUser()

if (user) {
const { data: enrollment } = await supabase
  .from('course_enrollments')
  .select('id')
  .eq('student_id', user.id)
  .eq('course_id', courseId)
  .maybeSingle()

setIsEnrolled(!!enrollment)
}

    
      setCourse({
        id: courseData.id,
        title: courseData.title,
        lessons,
      })

      setCurrentVideoIndex(index >= 0 ? index : 0)
      setLoading(false)
    }

    loadCourse()
  }, [courseId, videoId])

  if (loading || !course) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  const currentLesson = course.lessons[currentVideoIndex]
  const nextLesson = course.lessons[currentVideoIndex + 1]

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
  
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="ghost" className="gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to course
            </Button>
          </Link>
  
          <div className="text-right hidden md:block">
            <p className="text-xs text-neutral-500 uppercase">Course</p>
            <p className="text-sm font-medium max-w-xs truncate">
              {course.title}
            </p>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
  
          {/* ================= LEFT : VIDEO + CONTENT ================= */}
          <div className="space-y-6">
  
            {/* TITLE */}
            <div>
              <h1 className="text-2xl font-semibold leading-tight">
                {currentLesson?.title}
              </h1>
              <p className="text-sm text-neutral-500">
                Lesson {currentVideoIndex + 1} of {course.lessons.length}
              </p>
            </div>
  
            {/* VIDEO */}
            <div className="rounded-2xl overflow-hidden border bg-white">
              {currentLesson?.video_url ? (
                <Video
                  src={getStarted}
                  theme={Instaplay}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-neutral-400">
                  Video unavailable
                </div>
              )}
            </div>
  
            {/* DESCRIPTION */}
            {currentLesson?.description && (
              <div className="rounded-xl border bg-white p-5">
                <h3 className="text-sm font-semibold mb-2">
                  Lesson overview
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {currentLesson.description}
                </p>
              </div>
            )}
  
            {/* PROGRESS + NEXT */}
            <div className="space-y-4">
              <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      ((currentVideoIndex + 1) /
                        course.lessons.length) *
                      100
                    }%`,
                  }}
                />
              </div>
  
              {nextLesson && (
                <Button
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setCurrentVideoIndex(currentVideoIndex + 1)
                    router.push(
                      `/student/courses/${courseId}/play/${nextLesson.id}`
                    )
                  }}
                >
                  Next lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
  
          {/* ================= RIGHT : LESSON LIST ================= */}
          <div className="sticky top-20 h-fit">
            <div className="rounded-2xl border bg-white overflow-hidden">
  
              {/* HEADER */}
              <div className="px-5 py-4 border-b">
                <h3 className="text-sm font-semibold">
                  Course content
                </h3>
                <p className="text-xs text-neutral-500">
                  {course.lessons.length} lessons
                </p>
              </div>
  
              {/* LESSONS */}
              <div className="max-h-[420px] overflow-y-auto p-3 space-y-1">
                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/play/${lesson.id}`}
                  >
                    <div
                      className={`px-4 py-3 rounded-lg text-sm transition cursor-pointer ${
                        index === currentVideoIndex
                          ? 'bg-blue-600 text-white font-medium'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {index + 1}. {lesson.title}
                    </div>
                  </Link>
                ))}


  {/* ================= CAPSTONE ================= */}
  {capstoneCourse && (
  <div className="mt-3 border-t pt-3">
    <Button
      variant="outline"
      className="w-full justify-start gap-2"
      onClick={() =>
        router.push(
          `/student/capstone/${capstoneCourse.id}/stage/1`
        )
      }
    >
      🎯 Capstone Project
    </Button>
  </div>
)}




              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
}
