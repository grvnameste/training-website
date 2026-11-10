//app/student/courses/[id]/play/[videoId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, MessageCircle } from 'lucide-react'
import Video from 'next-video'
import getStarted from '@/videos/get-started.mp4.json'
import supabase from '@/lib/supabase/client'
import Instaplay from 'player.style/instaplay/react'
import { usePresence } from '@/hooks/usePresence'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { ChatModal } from '@/components/ChatModal'
import { useStudentCourse } from '@/hooks/useStudentCourse'
import { LessonList } from '@/components/student/LessonList'
import { CapstoneSection } from '@/components/student/CapstoneSection'
import { CertificateSection } from '@/components/student/CertificateSection'

export default function CoursePlayerPage() {


  
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const videoId = params.videoId as string


  const [studentUUID, setStudentUUID] = useState<string>('')

  


  const {
    course,
    loading,
    isEnrolled,
    capstoneCourse,
    capstoneStage,
    stage3Submitted,
    certificateRequested,
    certificateIssued,
    setCertificateRequested,
    user,
    teacherId,
    meeting
  } = useStudentCourse(courseId, videoId)


  useEffect(() => {
    const getUUID = async () => {

      console.log("👤 Clerk user:", user)  


      if (!user?.id) return
  
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', user.id)
        .single()
  
      if (error) {
        console.log('UUID fetch error:', error)
        return
      }
  
      if (data?.id) {
        setStudentUUID(data.id)
        console.log('✅ UUID:', data.id)
      }
    }
  
    getUUID()
  }, [user])

  const [isChatOpen, setIsChatOpen] = useState(false)

  // 🛰️ Track Presence
  const { isUserOnline } = usePresence(user?.id || null, user?.name || null, courseId)
  const unreadCount = useUnreadCount(studentUUID || null, courseId)
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
  const flatLessons = course.sections.flatMap(section => section.lessons)
  const currentVideoIndex = flatLessons.findIndex(l => l.id === videoId)
  const currentLesson = flatLessons[currentVideoIndex]
  const nextLesson = flatLessons[currentVideoIndex + 1]

  if (!currentLesson) {
    return (
      <div className="flex justify-center py-32 text-neutral-500">
        Lesson not found
      </div>
    )
  }

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
            <p className="text-sm font-medium max-w-xs truncate">{course.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* ================= LEFT : VIDEO + CONTENT ================= */}
          <div className="space-y-6">

            {/* TITLE */}
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{currentLesson?.title}</h1>
              <p className="text-sm text-neutral-500">
                Lesson {currentVideoIndex + 1} of {flatLessons.length}
              </p>
            </div>

            {/* VIDEO */}
            <div className="rounded-2xl overflow-hidden border bg-white">
              {currentLesson?.video_url ? (
                <Video
                  src={getStarted as any}
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
                <h3 className="text-sm font-semibold mb-2">Lesson overview</h3>
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
                    width: `${((currentVideoIndex + 1) / flatLessons.length) * 100}%`,
                  }}
                />
              </div>

              {nextLesson && (
                <Button
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    router.push(`/student/courses/${courseId}/play/${nextLesson.id}`)
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
              <div className="px-5 py-4 border-b">
                <h3 className="text-sm font-semibold">Course content</h3>
                <p className="text-xs text-neutral-500">{flatLessons.length} lessons</p>
              </div>

              <LessonList
                sections={course.sections}
                currentLessonId={videoId}
                courseId={courseId}
              />

              <div className="p-3 bg-slate-50 border-t space-y-4">
                {/* ================= CAPSTONE ================= */}
                <CapstoneSection
                  capstoneCourse={capstoneCourse}
                  capstoneStage={capstoneStage}
                  stage3Submitted={stage3Submitted}
                  meeting={meeting}
                />

                {/* ================= CERTIFICATE ================= */}
                <CertificateSection
                  capstoneCourse={capstoneCourse}
                  stage3Submitted={stage3Submitted}
                  certificateRequested={certificateRequested}
                  certificateIssued={certificateIssued}
                  setCertificateRequested={setCertificateRequested}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Floating Chat Button */}
      {isEnrolled && teacherId && studentUUID && (
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
            <span className="absolute right-16 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider shadow-lg">
              Support Chat
            </span>
          </Button>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            studentId={studentUUID}
                          teacherId={teacherId}
            courseId={courseId}
            courseTitle={course.title}
          />
        </>
      )}
    </div>
  )
}
