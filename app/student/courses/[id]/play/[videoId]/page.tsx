'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface Lesson {
  id: string
  title: string
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
          .select('id, title, video_url')
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
        <div className="h-10 w-10 rounded-full border-2 border-teal-400/40 border-t-teal-400 animate-spin" />
      </div>
    )
  }

  const currentLesson = course.lessons[currentVideoIndex]
  const nextLesson = course.lessons[currentVideoIndex + 1]

  return (
    <div className="relative min-h-screen px-8 py-12 text-white">

      {/* GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 bg-teal-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-40 -right-40 h-96 w-96 bg-cyan-400/20 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto space-y-8">

        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link href={`/student/courses/${courseId}`}>
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          <div className="hidden md:block text-right">
            <p className="text-xs text-white/40 uppercase">
              Course
            </p>
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
                Lesson {currentVideoIndex + 1}:{' '}
                {currentLesson?.title}
              </h1>
              <p className="text-xs text-white/50">
                Lesson {currentVideoIndex + 1} of{' '}
                {course.lessons.length}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
              {currentLesson?.video_url ? (
                <video
                  src={currentLesson.video_url}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                />
              ) : (
                <div className="flex items-center justify-center aspect-video text-white/40">
                  Video unavailable
                </div>
              )}
            </div>

            {/* PROGRESS */}
            <div className="space-y-4">
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div
                  className="bg-teal-400 h-2 rounded-full transition-all"
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
                  className="w-full rounded-full bg-teal-400 text-black hover:bg-teal-300"
                  onClick={() => {
                    setCurrentVideoIndex(
                      currentVideoIndex + 1
                    )
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
            <Card className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl lg:sticky lg:top-24">
              <CardContent className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
                <h3 className="text-sm font-semibold text-white">
                  Course Lessons
                </h3>

                {course.lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/play/${lesson.id}`}
                  >
                    <div
                      className={`px-4 py-3 rounded-xl text-sm transition ${
                        index === currentVideoIndex
                          ? 'bg-teal-400 text-black font-semibold'
                          : 'bg-black/40 text-white/70 hover:bg-black/60'
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
