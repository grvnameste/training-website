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
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'

/* =======================
   TYPES
======================= */
interface CapstoneProject {
  id: string
  title: string
  description: string
}

interface StudentCapstoneProgress {
  id: string
  current_stage: number
  is_approved: boolean
  trello_board_url: string | null
}

/* =======================
   PAGE
======================= */
export default function CapstonePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [capstone, setCapstone] =
    useState<CapstoneProject | null>(null)
  const [progress, setProgress] =
    useState<StudentCapstoneProgress | null>(null)

  /* =======================
     LOAD DATA
  ======================= */
  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      /* 1️⃣ Get capstone for course */
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

      /* 2️⃣ Get student progress (STRICT: one row only) */
      const { data: progressData } = await supabase
        .from('student_capstone_progress')
        .select(
          'id, current_stage, is_approved, trello_board_url'
        )
        .eq('student_id', session.user.id)
        .eq('capstone_id', capstoneData.id)
        .maybeSingle()

      setProgress(progressData || null)
      setLoading(false)
    }

    load()
  }, [courseId, router])

  /* =======================
     ACTIONS
  ======================= */
  const startCapstone = async () => {
    if (!capstone) return

    setActionLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setActionLoading(false)
      return
    }

    /**
     * ✅ IMPORTANT FIX
     * - UPSERT instead of INSERT
     * - Prevents duplicate progress rows
     * - Idempotent (safe on double click / refresh)
     */
    const { error } = await supabase
      .from('student_capstone_progress')
      .upsert(
        {
          student_id: user.id,
          capstone_id: capstone.id,
          current_stage: 1,
          is_approved: false,
        },
        {
          onConflict: 'student_id,capstone_id',
        }
      )

    if (error) {
      alert(error.message)
      setActionLoading(false)
      return
    }

    router.push(`/student/capstone/${capstone.id}/stage/1`)
  }

  /* =======================
     UI STATES
  ======================= */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (!capstone) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href={`/student/courses/${courseId}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>No Capstone Project</CardTitle>
            <CardDescription>
              This course does not include a capstone project.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  /* =======================
     MAIN UI
  ======================= */
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* BACK */}
      <Link href={`/student/courses/${courseId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      {/* CAPSTONE INFO */}
      <Card>
        <CardHeader>
          <CardTitle>{capstone.title}</CardTitle>
          <CardDescription>{capstone.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This capstone project follows the Software Development
            Life Cycle (SDLC)
          </p>

          <ul className="list-disc ml-6 text-sm space-y-1">
            <li>Requirement Gathering</li>
            <li>Requirement Clarification & Approval</li>
            <li>System Design</li>
            <li>Development</li>
            <li>Testing</li>
            <li>Deployment</li>
            <li>Retrospective</li>
          </ul>
        </CardContent>
      </Card>

      {/* FIRST TIME */}
      {!progress && (
        <Card>
          <CardContent className="pt-6">
            <Button
              className="w-full"
              onClick={startCapstone}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Starting...'
                : 'Start Capstone Project'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* EXISTING PROGRESS */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Current Stage: {progress.current_stage}
            </div>

            {/* STAGE 1 LOCK */}
            {progress.current_stage === 1 &&
              !progress.is_approved && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Lock className="h-4 w-4" />
                  Requirement document pending approval
                </div>
              )}

            {/* TRELLO ACCESS */}
            {progress.is_approved &&
              progress.trello_board_url &&
              progress.current_stage >= 2 && (
                <Button
                className="w-full"
                onClick={() => {
                  if (!progress.trello_board_url) return
                  window.open(progress.trello_board_url, '_blank')
                }}
              >
                Access Your Trello Board
              </Button>
              
              )}

            {/* CONTINUE */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(
                  `/student/capstone/${capstone.id}/stage/${progress.current_stage}`
                )
              }
            >
              Continue Capstone Work
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
