//app/student/courses/[id]/play/[videoId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  sections: Section[]
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
  const [loading, setLoading] = useState(true)
  // const [capstone, setCapstone] = useState<Capstone | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [capstoneCourse, setCapstoneCourse] = useState<{
    id: string
    title: string
  } | null>(null)

  const [capstoneStage, setCapstoneStage] = useState(1)

  
  
  useEffect(() => {
    const loadCourse = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // ================= ENROLLMENT CHECK =================
if (user) {
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  setIsEnrolled(!!enrollment)
}


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
        .select('id, title')   // 👈 yaha title ADD
        .eq('course_id', courseId)

      const sectionIds = sections?.map(s => s.id) || []

      let sectionsWithLessons: Section[] = []

if (sectionIds.length > 0) {
  const { data: lessonData } = await supabase
    .from('lessons')
    .select('id, title, description, video_url, section_id')
    .in('section_id', sectionIds)
    .order('order_index', { ascending: true })

  const lessonsBySection: Record<string, Lesson[]> = {}

  lessonData?.forEach(lesson => {
    if (!lessonsBySection[lesson.section_id]) {
      lessonsBySection[lesson.section_id] = []
    }
    lessonsBySection[lesson.section_id].push(lesson)
  })

  sectionsWithLessons = (sections ?? []).map(section => ({
    id: section.id,
    title: section.title,
    lessons: lessonsBySection[section.id] || [],
  }))
}



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
// ================= CAPSTONE PROGRESS =================
if (capstoneData && user) {
  const { data: progress } = await supabase
    .from('student_capstone_progress')
    .select('current_stage')
    .eq('student_id', user.id)
    .eq('capstone_id', capstoneData.id)
    .maybeSingle()

  setCapstoneStage(progress?.current_stage ?? 1)
}





   
      


    
setCourse({
  id: courseData.id,
  title: courseData.title,
  sections: sectionsWithLessons,
})


      setLoading(false)
    }

    loadCourse()
  }, [courseId, videoId])

  // ✅ SAVE LAST WATCHED LESSON (CONTINUE FEATURE)


  if (loading || !course) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
    
  }


  if (!isEnrolled) {
    return (
      <div className="flex justify-center py-32 text-neutral-500">
        You are not enrolled in this course
      </div>
    )
  }
  
  // ================= FLATTEN LESSONS =================
const flatLessons = course.sections.flatMap(
  section => section.lessons
)

const currentVideoIndex = flatLessons.findIndex(
  l => l.id === videoId
)

const currentLesson = flatLessons[currentVideoIndex]
const nextLesson = flatLessons[currentVideoIndex + 1]

if (!currentLesson) {
  return (
    <div className="flex justify-center py-32 text-neutral-500">
      Lesson not found
    </div>
  )
}

  // ✅ SAVE LAST WATCHED LESSON (CONTINUE FEATURE)





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
              Lesson {currentVideoIndex + 1} of {flatLessons.length}
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
                      ((currentVideoIndex + 1) / flatLessons.length) * 100

                    }%`,
                  }}
                />
              </div>
  
              {nextLesson && (
                <Button
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
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
                {flatLessons.length} lessons
                </p>
              </div>
  
              {/* LESSONS */}
              <div className="max-h-[420px] overflow-y-auto p-3 space-y-1">
              {course.sections.map((section, sIndex) => (
  <div key={section.id} className="space-y-1">

    <div className="px-4 pt-3 text-xs font-semibold text-neutral-500 uppercase">
      {sIndex + 1}. {section.title}
    </div>

    {section.lessons.map((lesson, lIndex) => {
      const globalIndex =
        course.sections
          .slice(0, sIndex)
          .reduce((acc, s) => acc + s.lessons.length, 0) + lIndex

      return (
        <Link
          key={lesson.id}
          href={`/student/courses/${courseId}/play/${lesson.id}`}
        >
          <div
            className={`ml-3 px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
              lesson.id === currentLesson?.id
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            {globalIndex + 1}. {lesson.title}
          </div>
        </Link>
      )
    })}
  </div>
))}



  {/* ================= CAPSTONE ================= */}
{capstoneCourse && (
  <div className="mt-4 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-4 space-y-3">

    {/* HEADER */}
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-lg">
        🎯
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
          Capstone Project
        </p>
        <p className="text-xs text-neutral-500">
          Final hands-on implementation
        </p>
      </div>
    </div>

    {/* STAGES */}
    <div className="space-y-2 pt-2">

      {/* STAGE 1 */}
      <div
        onClick={() =>
          router.push(`/student/capstone/${capstoneCourse.id}/stage/1`)
        }
        className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer
                   bg-white hover:bg-blue-100 border border-blue-200
                   flex justify-between items-center"
      >
        <span>Stage 1 – Requirement</span>
        {capstoneStage > 1 && <span className="text-green-600">✔</span>}
      </div>

      {/* STAGE 2 */}
      <div
        onClick={() => {
          if (!isLocked(2)) {
            router.push(`/student/capstone/${capstoneCourse.id}/stage/2`)
          }
        }}
        className={`px-4 py-3 rounded-xl text-sm font-medium
          flex justify-between items-center border
          ${isLocked(2)
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white hover:bg-blue-100 cursor-pointer border-blue-200'}
        `}
      >
        <span>Stage 2 – Backlog</span>
        {isLocked(2) ? <span>🔒</span> : <span className="text-green-600">✔</span>}
      </div>

      {/* STAGE 3 */}
      <div
        onClick={() => {
          if (!isLocked(3)) {
            router.push(`/student/capstone/${capstoneCourse.id}/stage/3`)
          }
        }}
        className={`px-4 py-3 rounded-xl text-sm font-medium
          flex justify-between items-center border
          ${isLocked(3)
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white hover:bg-blue-100 cursor-pointer border-blue-200'}
        `}
      >
        <span>Stage 3 – Development</span>
        {isLocked(3) ? <span>🔒</span> : <span className="text-green-600">✔</span>}
      </div>

    </div>
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
