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

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()

  const courseId = params.id as string
  const videoId = params.videoId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setLoading(false)
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
    <div className="min-h-screen px-8 py-10 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="ghost" className="px-0 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-500 uppercase">Course</p>
            <p className="text-sm font-medium max-w-xs truncate">
              {course.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* PLAYER */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">
                Lesson {currentVideoIndex + 1}: {currentLesson?.title}
              </h1>
              <p className="text-xs text-slate-500">
                Lesson {currentVideoIndex + 1} of {course.lessons.length}
              </p>
            </div>

            {/* VIDEO */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              {currentLesson?.video_url ? (
                <Video
                  src={getStarted}
                  theme={Instaplay}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                />
              ) : (
                <div className="flex items-center justify-center aspect-video text-slate-400">
                  Video Unavailable
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {currentLesson?.description && (
              <Card className="rounded-xl border bg-white shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <h3 className="text-sm font-semibold">
                    Lesson Description
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentLesson.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* PROGRESS */}
            <div className="space-y-4">
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
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
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setCurrentVideoIndex(currentVideoIndex + 1)
                    router.push(
                      `/student/courses/${courseId}/play/${nextLesson.id}`
                    )
                  }}
                >
                  Next Lesson: {nextLesson.title}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* PLAYLIST */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl border bg-white shadow-sm lg:sticky lg:top-24">
              <CardContent className="p-5 space-y-3 max-h-[480px] overflow-y-auto">
                <h3 className="text-sm font-semibold">
                  Course Lessons
                </h3>

                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/play/${lesson.id}`}
                  >
                    <div
                      className={`px-4 py-3 rounded-lg text-sm transition ${
                        index === currentVideoIndex
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {index + 1}. {lesson.title}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
