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
  ChevronRight,
  CheckCircle,
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
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const { data: capstoneData } = await supabase
        .from('capstone_projects')
        .select('id, title, description')
        .eq('course_id', courseId)
        .maybeSingle()

      if (!capstoneData) {
        setLoading(false)
        return
      }

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

    const {
      data: { user },
    } = await supabase.auth.getUser()
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
    <div className="max-w-6xl mx-auto space-y-10 py-10">
      <Link href={`/student/courses/${courseId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      {/* ================= CAPSTONE INTRO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>{capstone.title}</CardTitle>
          <CardDescription>{capstone.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* ================= START BUTTON ================= */}
      {!progress && (
        <Card>
          <CardContent className="pt-6">
            <Button className="w-full" onClick={startCapstone}>
              Start Capstone Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================= HORIZONTAL SDLC ROADMAP ================= */}
      {progress && (
        <Card className="bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">
              Capstone Project Roadmap
            </CardTitle>
            <CardDescription>
              Follow the steps from left to right. Click the highlighted step to
              continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center">
              {STAGES.map((stage, index) => {
                const Icon = stage.icon

                const isCompleted = progress.current_stage > stage.id
                const isActive = progress.current_stage === stage.id
                const isLocked =
                  progress.current_stage < stage.id ||
                  (stage.id === progress.current_stage + 1 &&
                    progress.submitted_for_review)

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    {/* STEP */}
                    <div className="flex flex-col items-center relative z-10">
                      <button
                        disabled={isLocked}
                        onClick={() =>
                          router.push(
                            `/student/capstone/${capstone.id}/stage/${stage.id}`
                          )
                        }
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                          ${
                            isCompleted
                              ? 'bg-green-600 text-white'
                              : isActive
                              ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-105'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }
                          ${!isLocked && 'hover:scale-110 hover:shadow-lg'}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </button>

                      <span
                        className={`mt-3 text-xs text-center max-w-[130px]
                          ${
                            isActive
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground'
                          }
                        `}
                      >
                        Step {stage.id}
                        <br />
                        {stage.title}
                      </span>

                      {isActive && (
                        <span className="mt-1 text-[10px] text-primary flex items-center gap-1">
                          Click to continue
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}

                      {isLocked && (
                        <span className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    {/* CONNECTOR */}
                    {index !== STAGES.length - 1 && (
                      <div className="flex-1 relative">
                        <div
                          className={`absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 rounded-full transition
                            ${
                              progress.current_stage > stage.id
                                ? 'bg-green-500'
                                : isActive
                                ? 'bg-primary/40'
                                : 'bg-muted'
                            }
                          `}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= LEGEND ================= */}
      {progress && (
        <div className="flex gap-8 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            Current
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600" />
            Completed
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-muted" />
            Locked
          </span>
        </div>
      )}
    </div>
  )
}
