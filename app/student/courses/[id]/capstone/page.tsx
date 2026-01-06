'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowLeft,
  Lock,
  FileText,
  MessageCircle,
  PenTool,
  Code,
  TestTube,
  Cloud,
  RotateCcw,
} from 'lucide-react'

/* ======================= TYPES ======================= */
interface CapstoneProject {
  id: string
  title: string
  description: string
}

interface StudentCapstoneProgress {
  id: string
  current_stage: number
  submitted_for_review: boolean
}

/* ======================= SDLC STAGES ======================= */
const STAGES = [
  { id: 1, title: 'Requirement Gathering', icon: FileText },
  { id: 2, title: 'Clarification & Backlog', icon: MessageCircle },
  { id: 3, title: 'System Design', icon: PenTool },
  { id: 4, title: 'Development', icon: Code },
  { id: 5, title: 'Testing', icon: TestTube },
  { id: 6, title: 'Deployment', icon: Cloud },
  { id: 7, title: 'Retrospective', icon: RotateCcw },
]

export default function CapstonePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [capstone, setCapstone] = useState<CapstoneProject | null>(null)
  const [progress, setProgress] =
    useState<StudentCapstoneProgress | null>(null)

  /* ======================= LOAD DATA ======================= */
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data: capstoneData } = await supabase
        .from('capstone_projects')
        .select('id, title, description')
        .eq('course_id', courseId)
        .maybeSingle()

      if (!capstoneData) return setLoading(false)

      setCapstone(capstoneData)

      const { data: progressData } = await supabase
        .from('student_capstone_progress')
        .select('id, current_stage, submitted_for_review')
        .eq('student_id', session.user.id)
        .eq('capstone_id', capstoneData.id)
        .maybeSingle()

      setProgress(progressData || null)
      setLoading(false)
    }

    load()
  }, [courseId, router])

  /* ======================= START CAPSTONE ======================= */
  const startCapstone = async () => {
    if (!capstone) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('student_capstone_progress')
      .upsert(
        {
          student_id: user.id,
          capstone_id: capstone.id,
          current_stage: 1,
          submitted_for_review: false,
        },
        { onConflict: 'student_id,capstone_id' }
      )
      .select()
      .single()

    // 🔥 KEY FIX: show SDLC flow immediately
    setProgress(data)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!capstone) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href={`/student/courses/${courseId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{capstone.title}</CardTitle>
          <CardDescription>{capstone.description}</CardDescription>
        </CardHeader>
      </Card>

      {!progress && (
        <Card>
          <CardContent className="pt-6">
            <Button className="w-full" onClick={startCapstone}>
              Start Capstone Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ======================= SDLC FLOW (ALWAYS AFTER START) ======================= */}
      {progress && (
        <div className="space-y-6">
          {STAGES.map(stage => {
            const Icon = stage.icon

            const isCompleted = progress.current_stage > stage.id
            const isCurrent = progress.current_stage === stage.id

            const isLocked =
              progress.current_stage < stage.id ||
              (stage.id === progress.current_stage + 1 &&
                progress.submitted_for_review)

            return (
              <Card key={stage.id} className="flex items-center gap-4 p-4">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold">
                    Step {stage.id}: {stage.title}
                  </p>
                </div>

                {!isLocked ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/student/capstone/${capstone.id}/stage/${stage.id}`
                      )
                    }
                  >
                    {isCompleted ? 'View' : 'Continue'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Locked
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
