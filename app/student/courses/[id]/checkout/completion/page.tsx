'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Award,
  CheckCircle2,
  Compass,
  Crown,
  GraduationCap,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Confetti } from '@/components/Confetti'

interface MasteryRank {
  label: string
  description: string
  badgeClassName: string
  icon: 'master' | 'graduate' | 'achiever' | 'explorer' | 'starter'
}

function getMasteryRank(score: number): MasteryRank {
  if (score >= 90) {
    return {
      label: 'Course Master',
      description: 'Top mastery distinction earned by completing virtually every lesson.',
      badgeClassName:
        'bg-amber-50 text-amber-800 border-amber-300 shadow-xs px-3.5 py-1.5 text-xs font-semibold rounded-full',
      icon: 'master',
    }
  }

  if (score >= 70) {
    return {
      label: 'Course Graduate',
      description: 'Strong mastery rank awarded for substantial lesson completion.',
      badgeClassName:
        'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs px-3.5 py-1.5 text-xs font-semibold rounded-full',
      icon: 'graduate',
    }
  }

  if (score >= 40) {
    return {
      label: 'Course Achiever',
      description: 'Steady progress through core curriculum lessons.',
      badgeClassName:
        'bg-blue-50 text-blue-800 border-blue-300 shadow-xs px-3.5 py-1.5 text-xs font-semibold rounded-full',
      icon: 'achiever',
    }
  }

  if (score > 0) {
    return {
      label: 'Course Explorer',
      description: 'Early momentum built — keep going to reach Graduate and Master ranks.',
      badgeClassName:
        'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-xs px-3.5 py-1.5 text-xs font-semibold rounded-full',
      icon: 'explorer',
    }
  }

  return {
    label: 'Course Starter',
    description: 'Enrolled and ready to begin your first lesson.',
    badgeClassName:
      'bg-slate-100 text-slate-700 border-slate-200 px-3.5 py-1.5 text-xs font-semibold rounded-full',
    icon: 'starter',
  }
}

function MasteryRankIcon({ icon }: { icon: MasteryRank['icon'] }) {
  switch (icon) {
    case 'master':
      return <Crown className="w-3.5 h-3.5 text-amber-600" />
    case 'graduate':
      return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
    case 'achiever':
      return <Award className="w-3.5 h-3.5 text-blue-600" />
    case 'explorer':
      return <Compass className="w-3.5 h-3.5 text-indigo-600" />
    case 'starter':
      return <Sparkles className="w-3.5 h-3.5 text-slate-500" />
  }
}

function CompletionContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const courseId = params.id as string
  const completedParam = searchParams.get('completed') === 'true'
  const scoreParam = searchParams.get('score')

  const [courseTitle, setCourseTitle] = useState<string>('')
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null)
  const [totalLessons, setTotalLessons] = useState(0)
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0)
  const [allLessonsCompleted, setAllLessonsCompleted] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    const load = async () => {
      try {
        setLoading(true)

        const [courseRes, enrolledRes] = await Promise.all([
          fetch(`/api/catalog/courses/${courseId}`, { cache: 'no-store' }),
          user ? fetch('/api/me/courses', { cache: 'no-store' }) : Promise.resolve(null),
        ])

        const courseData = await courseRes.json().catch(() => ({}))
        if (!courseRes.ok) return

        const course = courseData.course
        setCourseTitle(course?.title || '')

        const lessonIds: string[] = (course?.sections ?? []).flatMap((section: any) =>
          (section.lessons ?? []).map((lesson: any) => lesson.id)
        )
        setFirstLessonId(lessonIds[0] || null)
        setTotalLessons(lessonIds.length)

        let completedCount = 0
        if (enrolledRes?.ok) {
          const enrolledData = await enrolledRes.json().catch(() => ({}))
          const match = (enrolledData.courses ?? []).find(
            (item: any) => item.courseId === courseId
          )
          const completedIds: string[] = match?.progress?.completedLessonIds ?? []
          completedCount = lessonIds.filter((id) => completedIds.includes(id)).length
        }

        const isCourseDone =
          (lessonIds.length > 0 && completedCount === lessonIds.length) ||
          completedParam

        setCompletedLessonsCount(
          isCourseDone && lessonIds.length > 0 ? lessonIds.length : completedCount
        )
        setAllLessonsCompleted(isCourseDone)
      } catch (err) {
        console.error('Error loading completion details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) load()
  }, [courseId, user, isLoaded, completedParam])

  const finalCompletionScore = useMemo(() => {
    if (scoreParam !== null) {
      const parsed = Number(scoreParam)
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return Math.min(100, Math.max(0, Math.round(parsed)))
      }
    }
    if (totalLessons > 0) {
      return Math.round((completedLessonsCount / totalLessons) * 100)
    }
    return allLessonsCompleted ? 100 : 0
  }, [scoreParam, totalLessons, completedLessonsCount, allLessonsCompleted])

  const masteryRank = useMemo(
    () => getMasteryRank(finalCompletionScore),
    [finalCompletionScore]
  )

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Confetti active={allLessonsCompleted} burstKey={burstKey} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        {/* Status Icon */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-sm ${
            allLessonsCompleted
              ? 'bg-emerald-50 ring-4 ring-emerald-100'
              : 'bg-green-50'
          }`}
        >
          {allLessonsCompleted ? (
            <Award className="w-10 h-10 text-emerald-600" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          )}
        </motion.div>

        {/* Mastery Rank Badge */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="mb-4 flex flex-col items-center gap-1.5"
          >
            <Badge variant="outline" className={masteryRank.badgeClassName}>
              <MasteryRankIcon icon={masteryRank.icon} />
              <span>{masteryRank.label}</span>
              <span className="opacity-60">•</span>
              <span>{finalCompletionScore}%</span>
            </Badge>
            <p className="text-xs text-slate-500 max-w-sm">
              {masteryRank.description}
            </p>
          </motion.div>
        )}

        {allLessonsCompleted ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Congratulations!
            </h1>

            <p className="text-slate-600 max-w-lg mb-5">
              {courseTitle
                ? `You completed all ${totalLessons > 0 ? totalLessons : ''} lessons in "${courseTitle}".`
                : 'You have completed every lesson in this course.'}
            </p>

            {totalLessons > 0 && (
              <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>Final Lesson Completion Score</span>
                  <span className="text-emerald-600">
                    {completedLessonsCount} / {totalLessons} Lessons ({finalCompletionScore}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${finalCompletionScore}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                disabled={loading}
                onClick={() => {
                  if (firstLessonId) {
                    router.push(`/student/courses/${courseId}/play/${firstLessonId}`)
                  } else {
                    router.push(`/student/courses/${courseId}`)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
              >
                {loading ? 'Loading...' : 'Review Course →'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/student/my-courses')}
                className="px-6 py-3 rounded-xl"
              >
                My Courses
              </Button>

              <Button
                variant="ghost"
                onClick={() => setBurstKey((k) => k + 1)}
                className="gap-1.5 text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="w-4 h-4" />
                Replay Confetti
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Enrollment Successful
            </h1>

            <p className="text-slate-500 max-w-md mb-8">
              You now have full access to this course. Start learning anytime.
            </p>

            <Button
              disabled={loading}
              onClick={() => {
                if (firstLessonId) {
                  router.push(`/student/courses/${courseId}/play/${firstLessonId}`)
                } else {
                  router.push(`/student/courses/${courseId}`)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
            >
              {loading ? 'Loading...' : 'Go to Course →'}
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function CompletionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-24 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      }
    >
      <CompletionContent />
    </Suspense>
  )
}