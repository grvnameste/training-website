<<<<<<< HEAD
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FileText,
  Loader2,
  Lock,
  NotebookPen,
  PlayCircle,
  Sparkles,
  StickyNote,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'

type Block = {
  id: string
  type: string
  position: number
  content: Record<string, any>
}

type Resource = {
  id: string
  title: string
  kind: string
  fileName: string | null
  mimeType: string | null
  sizeBytes: number | null
  externalUrl: string | null
  downloadUrl: string | null
}

type Lesson = {
  id: string
  title: string
  description: string | null
  summary: string | null
  objectives: string[]
  estimatedMinutes: number | null
  completionMode: string
  isPreview: boolean
  videoUrl: string | null
  duration: string | null
  blocks: Block[]
  resources: Resource[]
  transcript: { language: string; fullText: string; segments: any[] } | null
  note: string
}

type CurriculumSection = {
  id: string
  title: string
  orderIndex: number
  lessons: {
    id: string
    title: string
    duration: string | null
    isPreview: boolean
    completed: boolean
  }[]
}

type PlayerPayload = {
  course: {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    isCapstone: boolean
  }
  lesson: Lesson
  progress: {
    totalLessons: number
    completedLessons: number
    percentage: number
    completedLessonIds: string[]
  }
  navigation: {
    previousLessonId: string | null
    nextLessonId: string | null
  }
  curriculum: CurriculumSection[]
  canViewFullCourse: boolean
  capstone: {
    id: string
    title: string
    currentStage: number
    stage3Submitted: boolean
    completed: boolean
    certificateRequested: boolean
    certificateIssued: boolean
  } | null
}

const POSITION_INTERVAL_MS = 15000
const NOTE_DEBOUNCE_MS = 900

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.videoId as string

  const [payload, setPayload] = useState<PlayerPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'resources' | 'notes'>(
    'overview'
  )
  const [note, setNote] = useState('')
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [completing, setCompleting] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastSavedPositionRef = useRef(0)
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noteLoadedRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/me/courses/${courseId}/player?lessonId=${encodeURIComponent(lessonId)}`,
        { cache: 'no-store' }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load this lesson')
      setPayload(data)
      setNote(data?.lesson?.note ?? '')
      noteLoadedRef.current = true
      lastSavedPositionRef.current = 0
    } catch (err: any) {
      setError(err?.message || 'Could not load this lesson')
    } finally {
      setLoading(false)
    }
  }, [courseId, lessonId])

  useEffect(() => {
    void load()
  }, [load])

  const savePosition = useCallback(
    async (position: number, duration?: number, keepalive = false) => {
      if (!payload || !payload.canViewFullCourse) return
      if (Math.abs(position - lastSavedPositionRef.current) < 2) return
      lastSavedPositionRef.current = position

      try {
        await fetch(`/api/learning/lessons/${payload.lesson.id}/position`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            positionSeconds: position,
            durationSeconds: duration,
          }),
          keepalive,
        })
      } catch {
        // Position persistence is best-effort.
      }
    },
    [payload, courseId]
  )

  useEffect(() => {
    if (!payload) return
    const interval = setInterval(() => {
      const video = videoRef.current
      if (video && !video.paused) {
        void savePosition(video.currentTime, video.duration)
      }
    }, POSITION_INTERVAL_MS)

    return () => {
      clearInterval(interval)
      const video = videoRef.current
      if (video) void savePosition(video.currentTime, video.duration, true)
    }
  }, [payload, savePosition])

  useEffect(() => {
    if (!noteLoadedRef.current) return
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current)

    noteTimerRef.current = setTimeout(async () => {
      setNoteStatus('saving')
      try {
        const res = await fetch(`/api/me/lessons/${lessonId}/notes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: note }),
        })
        if (!res.ok) throw new Error('Could not save note')
        setNoteStatus('saved')
      } catch {
        setNoteStatus('error')
      }
    }, NOTE_DEBOUNCE_MS)

    return () => {
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current)
    }
  }, [note, lessonId])

  const complete = useCallback(
    async (source: 'explicit' | 'video_ended' = 'explicit') => {
      if (!payload || completing) return
      setCompleting(true)
      try {
        const res = await fetch(`/api/learning/lessons/${payload.lesson.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, source }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'Could not complete lesson')
        await load()
        toast.success('Lesson completed')
      } catch (err: any) {
        toast.error(err?.message || 'Could not complete lesson')
      } finally {
        setCompleting(false)
      }
    },
    [payload, completing, courseId, load]
  )

  const isCompleted = useMemo(
    () => Boolean(payload?.progress.completedLessonIds.includes(lessonId)),
    [payload, lessonId]
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading learning workspace…</p>
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <Lock className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Lesson unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{error || 'Lesson not found'}</p>
        <Link href={`/student/courses/${courseId}`}>
          <Button className="mt-5" variant="outline">
            Back to course
          </Button>
        </Link>
      </div>
    )
  }

  const { course, lesson, progress, navigation, curriculum, canViewFullCourse } = payload

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/student/courses/${courseId}`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <div className="text-right text-xs text-slate-500">
          <p className="font-semibold uppercase tracking-widest">{course.title}</p>
          <p>
            {progress.completedLessons} of {progress.totalLessons} lessons completed ·{' '}
            {progress.percentage}%
          </p>
        </div>
      </div>

      {!canViewFullCourse && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            You are viewing a preview lesson. Enroll to unlock the full course.
          </p>
          <Link href={`/student/courses/${courseId}`}>
            <Button className="bg-amber-600 text-white hover:bg-amber-700">
              View enrollment
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {lesson.title}
              </h1>
              {lesson.isPreview && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  Preview
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : lesson.duration || 'Self-paced'}
            </p>
          </div>

          {lesson.videoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black">
              <video
                ref={videoRef}
                key={lesson.id}
                src={lesson.videoUrl}
                controls
                className="aspect-video w-full"
                onPause={(event) =>
                  void savePosition(
                    event.currentTarget.currentTime,
                    event.currentTarget.duration
                  )
                }
                onEnded={(event) => {
                  void savePosition(
                    event.currentTarget.currentTime,
                    event.currentTarget.duration
                  )
                  if (lesson.completionMode === 'video_ended' && !isCompleted) {
                    void complete('video_ended')
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
              <BookOpen className="mr-2 h-5 w-5" /> Reading lesson
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => complete('explicit')}
              disabled={completing || isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                </>
              ) : completing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark lesson complete
                </>
              )}
            </Button>

            {navigation.previousLessonId && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  router.push(`/student/courses/${courseId}/play/${navigation.previousLessonId}`)
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
            )}
            {navigation.nextLessonId && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  router.push(`/student/courses/${courseId}/play/${navigation.nextLessonId}`)
                }
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
              {(
                [
                  ['overview', 'Overview', BookOpen],
                  ['transcript', 'Transcript', FileText],
                  ['resources', 'Resources', Download],
                  ['notes', 'Notes', NotebookPen],
                ] as const
              ).map(([tab, label, Icon]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {lesson.objectives.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Learning objectives
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {lesson.objectives.map((objective) => (
                          <li key={objective} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lesson.blocks.length > 0 ? (
                    <LessonBlocks blocks={lesson.blocks} />
                  ) : lesson.description ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {lesson.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">No lesson notes have been added yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="space-y-2">
                  {lesson.transcript ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {lesson.transcript.fullText}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">No transcript is available for this lesson.</p>
                  )}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-2">
                  {lesson.resources.length > 0 ? (
                    lesson.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.externalUrl || resource.downloadUrl || '#'}
                        target={resource.externalUrl ? '_blank' : undefined}
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <span className="font-medium text-slate-800">{resource.title}</span>
                        <Download className="h-4 w-4 text-slate-400" />
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No resources attached to this lesson.</p>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Private notes
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {noteStatus === 'saving'
                        ? 'Saving…'
                        : noteStatus === 'saved'
                        ? 'Saved'
                        : noteStatus === 'error'
                        ? 'Save failed'
                        : ''}
                    </span>
                  </div>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={10}
                    placeholder="Write notes for this lesson…"
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h2 className="text-sm font-semibold text-slate-900">Course content</h2>
              <p className="text-xs text-slate-500">
                {progress.totalLessons} lessons · {progress.percentage}% complete
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {curriculum.map((section) => (
                <div key={section.id} className="mb-2">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.lessons.map((item) => {
                      const active = item.id === lessonId
                      return (
                        <Link
                          key={item.id}
                          href={`/student/courses/${courseId}/play/${item.id}`}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition ${
                            active
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                          )}
                          <span className="flex-1 leading-snug">{item.title}</span>
                          {item.isPreview && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                              Preview
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {payload.capstone && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-800">
                <Target className="h-4 w-4" /> Capstone project
              </p>
              <p className="mt-2 text-sm font-medium text-blue-950">
                {payload.capstone.title}
              </p>
              <p className="mt-1 text-xs text-blue-800">
                Stage {payload.capstone.currentStage} of 3
                {payload.capstone.completed ? ' · completed' : ''}
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  href={`/student/capstone/${payload.capstone.id}/stage/${payload.capstone.currentStage}`}
                >
                  <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    Open capstone
                  </Button>
                </Link>
                {payload.capstone.certificateIssued && (
                  <a
                    href={`/api/certificate/download?courseId=${payload.capstone.id}`}
                    download="certificate.pdf"
                  >
                    <Button size="sm" variant="outline" className="w-full">
                      <Award className="mr-1.5 h-4 w-4" /> Download certificate
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <StickyNote className="h-4 w-4" /> Learning tip
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Complete each lesson explicitly. Your progress is saved and the dashboard will resume
              you at the last lesson you opened.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.type === 'heading') {
          return (
            <h3 key={block.id} className="text-lg font-semibold text-slate-900">
              {block.content.text}
            </h3>
          )
        }
        if (block.type === 'callout') {
          return (
            <div
              key={block.id}
              className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-950"
            >
              {block.content.title && (
                <p className="font-semibold">{block.content.title}</p>
              )}
              <p className="mt-1 whitespace-pre-line">{block.content.body}</p>
            </div>
          )
        }
        if (block.type === 'code') {
          return (
            <pre
              key={block.id}
              className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100"
            >
              <code>{block.content.code}</code>
            </pre>
          )
        }
        if (block.type === 'checklist') {
          return (
            <div key={block.id} className="rounded-xl border border-slate-200 p-4">
              {block.content.title && (
                <p className="text-sm font-semibold text-slate-900">{block.content.title}</p>
              )}
              <ul className="mt-2 space-y-1.5">
                {(block.content.items || []).map((item: string) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        }
        if (block.type === 'image') {
          return block.content.url ? (
            <img
              key={block.id}
              src={block.content.url}
              alt={block.content.alt || ''}
              className="w-full rounded-xl border border-slate-200"
            />
          ) : null
        }
        return (
          <p
            key={block.id}
            className="whitespace-pre-line text-sm leading-relaxed text-slate-700"
          >
            {block.content.markdown || block.content.text || ''}
          </p>
        )
      })}
    </div>
  )
}
=======
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
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
