//app/student/courses/[id]/play/videoId/page.tsx
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
      /* 1️⃣ Fetch course */
      const { data: courseData, error: courseError } =
        await supabase
          .from('courses')
          .select('id, title')
          .eq('id', courseId)
          .single()

      if (courseError || !courseData) {
        console.error(courseError)
        setLoading(false)
        return
      }

      /* 2️⃣ Fetch section IDs */
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('course_id', courseId)

      const sectionIds =
        sections?.map(s => s.id) || []

      if (sectionIds.length === 0) {
        setCourse({
          id: courseData.id,
          title: courseData.title,
          lessons: [],
        })
        setLoading(false)
        return
      }

      /* 3️⃣ Fetch lessons using section IDs */
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, video_url')
        .in('section_id', sectionIds)
        .order('order_index', { ascending: true })

      const safeLessons = lessons || []

      const index = safeLessons.findIndex(
        l => l.id === videoId
      )

      setCourse({
        id: courseData.id,
        title: courseData.title,
        lessons: safeLessons,
      })

      setCurrentVideoIndex(index >= 0 ? index : 0)
      setLoading(false)
    }

    loadCourse()
  }, [courseId, videoId])

  if (loading || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-sm text-foreground/70">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p>Loading lesson...</p>
      </div>
    )
  }

  const currentLesson = course.lessons[currentVideoIndex]
  const nextLesson = course.lessons[currentVideoIndex + 1]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/student/courses/${courseId}`}>
          <Button variant="outline" className="rounded-full px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Link>

        <div className="hidden md:flex flex-col items-end">
          <p className="text-xs text-foreground/50 uppercase">
            Course
          </p>
          <p className="text-sm font-medium line-clamp-1 max-w-xs">
            {course.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Player */}
        <div className="lg:col-span-3 space-y-5">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Lesson {currentVideoIndex + 1}:{' '}
              {currentLesson?.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Lesson {currentVideoIndex + 1} of{' '}
              {course.lessons.length}
            </p>
          </div>

          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border">
            {currentLesson?.video_url ? (
              <video
                src={currentLesson.video_url}
                controls
                autoPlay
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Video unavailable
              </div>
            )}
          </div>

          {/* Progress + Next */}
          <div className="space-y-3">
            <div className="w-full bg-border h-1.5 rounded-full">
              <div
                className="bg-primary h-1.5 rounded-full"
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
                className="w-full rounded-full"
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

        {/* Playlist */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl lg:sticky lg:top-24">
            <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
              <h3 className="text-sm font-semibold">
                Course Lessons
              </h3>

              {course.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/student/courses/${courseId}/play/${lesson.id}`}
                >
                  <div
                    className={`p-3 rounded-xl text-sm border transition ${
                      index === currentVideoIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/70'
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
  )
}
