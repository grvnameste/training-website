//app/student/courses/[id]/play/[videoId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, MessageCircle } from 'lucide-react'
import Video from 'next-video'
import getStarted from '@/videos/get-started.mp4.json'
import Instaplay from 'player.style/instaplay/react'
import { usePresence } from '@/hooks/usePresence'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { ChatModal } from '@/components/ChatModal'

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

  
  const [stage3Submitted, setStage3Submitted] = useState(false)
const [capstoneCompleted, setCapstoneCompleted] = useState(false)
const [certificateIssued, setCertificateIssued] = useState(false)

const [certificateRequested, setCertificateRequested] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)

  // 🛰️ Track Presence
  const { isUserOnline } = usePresence(user?.id || null, user?.name || null, courseId)
  const unreadCount = useUnreadCount(user?.id || null, courseId)

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: profile } = await supabase.from('profiles').select('full_name, name').eq('id', authUser.id).maybeSingle()
          setUser({
            id: authUser.id,
            name: profile?.full_name || profile?.name || authUser.email?.split('@')[0] || 'Student'
          })
        }

        // ================= ENROLLMENT CHECK =================
        if (authUser) {
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('student_id', authUser.id)
            .eq('course_id', courseId)
            .maybeSingle()

          setIsEnrolled(!!enrollment)
        }

        const { data: courseData } = await supabase
          .from('courses')
          .select('id, title, is_capstone, teacher_id')
          .eq('id', courseId)
          .single()

        if (!courseData) {
          // setLoading(false) // Removed as it's handled in finally
          return
        }

        setTeacherId(courseData.teacher_id)

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
        if (capstoneData && authUser) { // Changed user to authUser
          const { data: progress } = await supabase
            .from('student_capstone_progress')
            .select(`
              current_stage,
              stage3_submitted,
              completed,
              certificate_issued,
              certificate_requested
            `)
            .eq('student_id', authUser.id) // Changed user.id to authUser.id
            .eq('capstone_id', capstoneData.id)
            .maybeSingle()

          setCapstoneStage(progress?.current_stage ?? 1)
          setStage3Submitted(!!progress?.stage3_submitted)
          setCapstoneCompleted(!!progress?.completed)
          setCertificateIssued(!!progress?.certificate_issued)
          setCertificateRequested(!!progress?.certificate_requested)




        }





        setCourse({
          id: courseData.id,
          title: courseData.title,
          sections: sectionsWithLessons,
        })
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, videoId])

    // 🔐 capstone stage lock logic
    const isLocked = (stage: number) => {
      return capstoneStage < stage
    }
  

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
  <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-5 space-y-4 shadow-sm">

    {/* HEADER */}
    <div className="flex items-center gap-4">
      <div className="h-11 w-11 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl">
        🎯
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-700">
          Capstone Project
        </p>
        <p className="text-xs text-neutral-500">
          Apply everything you’ve learned in a real project
        </p>
      </div>
    </div>

    {/* STAGES */}
    <div className="space-y-2">

      {/* STAGE 1 */}
      <StageItem
        title="Stage 1 – Requirements"
        unlocked
        completed={capstoneStage > 1}
        onClick={() =>
          router.push(`/student/capstone/${capstoneCourse.id}/stage/1`)
        }
      />

      {/* STAGE 2 */}
      <StageItem
        title="Stage 2 – Backlog Planning"
        unlocked={!isLocked(2)}
        completed={capstoneStage > 2}
        onClick={() =>
          !isLocked(2) &&
          router.push(`/student/capstone/${capstoneCourse.id}/stage/2`)
        }
      />

      {/* STAGE 3 */}
      <StageItem
        title="Stage 3 – Development & Submission"
        unlocked={!isLocked(3)}
        completed={stage3Submitted}
        onClick={() =>
          !isLocked(3) &&
          router.push(`/student/capstone/${capstoneCourse.id}/stage/3`)
        }
      />

    </div>
  </div>
)}


{/* ================= CERTIFICATE ================= */}
{capstoneCourse && (
  <div className="mt-4 rounded-2xl border border-green-200 bg-white p-5 space-y-4 shadow-sm">

    <div className="flex items-center gap-3">
      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-600 text-white">
        🎓
      </div>
      <div>
        <p className="text-sm font-semibold text-green-700">
          Course Certificate
        </p>
        <p className="text-xs text-neutral-500">
          Earn a verified certificate after completing the capstone
        </p>
      </div>
    </div>

    {/* LOCKED STATE */}
    {!stage3Submitted && (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
        🔒 <span className="font-medium">
          Complete the capstone project to unlock your certificate.
        </span>
        <p className="text-xs text-green-700 mt-1">
          Finish all capstone stages and submit your final solution.
        </p>
      </div>
    )}

    {/* REQUEST CERTIFICATE */}
    {stage3Submitted &&
      !certificateRequested &&
      !certificateIssued && (
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser()

            await supabase
              .from('student_capstone_progress')
              .update({ certificate_requested: true })
              .eq('student_id', user!.id)
              .eq('capstone_id', capstoneCourse.id)

            setCertificateRequested(true)
          }}
        >
          Request Certificate
        </Button>
      )}

    {/* PENDING */}
    {certificateRequested && !certificateIssued && (
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
        ⏳ Certificate request submitted.  
        <p className="text-xs mt-1">
          Your certificate will be issued after review by the instructor.
        </p>
      </div>
    )}

    {/* DOWNLOAD */}
    {certificateIssued && (
      <Button
        variant="outline"
        className="w-full border-green-300 text-green-700"
        onClick={async () => {
          const { data: { session } } = await supabase.auth.getSession()

          const res = await fetch(
            `/api/certificate/download?courseId=${capstoneCourse.id}`,
            {
              headers: {
                Authorization: `Bearer ${session?.access_token}`,
              },
            }
          )

          if (!res.ok) {
            alert('Failed to download certificate')
            return
          }

          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)

          const a = document.createElement('a')
          a.href = url
          a.download = 'certificate.pdf'
          a.click()

          window.URL.revokeObjectURL(url)
        }}
      >
        Download Certificate
      </Button>
    )}
  </div>
)}



              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 💬 Floating Chat Button */}
      {isEnrolled && teacherId && (
        <>
          <Button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 group border-4 border-white"
            size="icon"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-white" />
              {isUserOnline(teacherId) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
              {unreadCount > 0 && !isChatOpen && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {/* Tooltip-like label on hover */}
            <span className="absolute right-16 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider shadow-lg">
              Support Chat
            </span>
          </Button>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            studentId={user?.id || ''}
            teacherId={teacherId}
            courseId={courseId}
            courseTitle={course.title}
          />
        </>
      )}
    </div>
  )
}


function StageItem({
  title,
  unlocked,
  completed,
  onClick,
}: {
  title: string
  unlocked: boolean
  completed: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={unlocked ? onClick : undefined}
      className={`px-4 py-3 rounded-xl text-sm font-medium border
        flex justify-between items-center transition
        ${unlocked
          ? 'bg-white hover:bg-blue-50 cursor-pointer border-blue-200'
          : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'}
      `}
    >
      <span>{title}</span>
      {completed ? (
        <span className="text-green-600">✔</span>
      ) : unlocked ? (
        <span className="text-blue-500">→</span>
      ) : (
        <span>🔒</span>
      )}
    </div>
  )
}
