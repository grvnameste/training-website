// app/student/courses/[id]/play/[videoId]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  videos: { id: string; name: string; file: string }[]
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const videoId = params.videoId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const found = allCourses.find((c: Course) => c.id === courseId)
    if (found) {
      setCourse(found)
      const index = found.videos.findIndex((v: any) => v.id === videoId)
      if (index !== -1) setCurrentVideoIndex(index)
    }
  }, [courseId, videoId])

  if (!course)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-foreground/70">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p>Loading...</p>
      </div>
    )

  const currentVideo = course.videos[currentVideoIndex]
  const nextVideo = course.videos[currentVideoIndex + 1]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/student/courses/${courseId}`}>
          <Button
            variant="outline"
            className="text-foreground border-border bg-background hover:bg-muted/70 rounded-full px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Link>

        <div className="hidden md:flex flex-col items-end">
          <p className="text-xs text-foreground/50 uppercase tracking-wide">
            Course
          </p>
          <p className="text-sm font-medium text-foreground/80 line-clamp-1 max-w-xs text-right">
            {course.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Video Player */}
        <div className="lg:col-span-3 space-y-5 lg:space-y-6">
          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-snug">
              Lesson {currentVideoIndex + 1}: {currentVideo?.name}
            </h1>
            <p className="text-xs md:text-sm text-foreground/60">
              Lesson {currentVideoIndex + 1} of {course.videos.length}
            </p>
          </div>

          {/* Video Container */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border/70 shadow-lg">
            {currentVideo?.file ? (
              <video
                src={currentVideo.file}
                controls
                className="w-full h-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-foreground/50">Video unavailable</p>
              </div>
            )}
          </div>

          {/* Progress Bar + Next Button */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${((currentVideoIndex + 1) / course.videos.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-foreground/60">
                Lesson {currentVideoIndex + 1} of {course.videos.length}
              </p>
            </div>

            {/* Navigation */}
            {nextVideo && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCurrentVideoIndex(currentVideoIndex + 1)
                    router.push(
                      `/student/courses/${courseId}/play/${nextVideo.id}`,
                    )
                  }}
                  className="bg-primary hover:bg-primary/90 flex-1 h-10 md:h-11 rounded-full text-sm md:text-base"
                >
                  Next Lesson: {nextVideo.name}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video Playlist */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border border-border/80 shadow-sm lg:sticky lg:top-24">
            <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground text-sm">
                  Course Lessons
                </h3>
                <span className="text-[11px] text-foreground/55">
                  {course.videos.length} lessons
                </span>
              </div>

              {course.videos.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/student/courses/${courseId}/play/${video.id}`}
                >
                  <div
                    className={`p-3 rounded-xl cursor-pointer border text-sm transition-all ${
                      index === currentVideoIndex
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/40 text-foreground border-transparent hover:bg-muted hover:border-border'
                    }`}
                  >
                    <p className="font-medium truncate">
                      {index + 1}. {video.name}
                    </p>
                    {index === currentVideoIndex && (
                      <p className="text-[11px] mt-1 text-primary-foreground/80">
                        Now playing
                      </p>
                    )}
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
