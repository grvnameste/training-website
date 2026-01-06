//app/student/capstone/[capstoneId]/stage/[stage]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ArrowLeft,
  Upload,
  Lock,
  CheckCircle,
  Github,
} from 'lucide-react'

export default function CapstoneStagePage() {
  const params = useParams()
  const router = useRouter()

  const capstoneId = params.capstoneId as string
  const stage = Number(params.stage)

  const [allowed, setAllowed] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const [submitted, setSubmitted] = useState(false)
  const [approved, setApproved] = useState(false)

  const [trelloUrl, setTrelloUrl] = useState<string | null>(null)
  const [trelloBoardId, setTrelloBoardId] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)

  const [submittedForReview, setSubmittedForReview] = useState(false)

  /* ======================
     STAGE ACCESS GUARD
  ====================== */
  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select('current_stage, submitted_for_review')
        .eq('student_id', user.id)
        .eq('capstone_id', capstoneId)
        .maybeSingle()

      if (!progress) {
        router.replace('/student/dashboard')
        return
      }

      if (stage > progress.current_stage) {
        router.replace(
          `/student/capstone/${capstoneId}/stage/${progress.current_stage}`
        )
        return
      }

      if (
        stage === 3 &&
        progress.current_stage === 2 &&
        progress.submitted_for_review
      ) {
        router.replace(`/student/capstone/${capstoneId}/stage/2`)
        return
      }

      setAllowed(true)
    }

    guard()
  }, [stage, capstoneId, router])

  /* ======================
     LOAD STAGE DATA
  ====================== */
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select('trello_board_url, trello_board_id, submitted_for_review')
        .eq('student_id', user.id)
        .eq('capstone_id', capstoneId)
        .maybeSingle()

      if (progress) {
        setTrelloUrl(progress.trello_board_url)
        setTrelloBoardId(progress.trello_board_id)
        setSubmittedForReview(!!progress.submitted_for_review)
      }

      if (stage === 1) {
        const { data } = await supabase
          .from('requirement_documents')
          .select('approved')
          .eq('student_id', user.id)
          .eq('capstone_id', capstoneId)
          .maybeSingle()

        if (data) {
          setSubmitted(true)
          setApproved(!!data.approved)
        }
      }
    }

    load()
  }, [stage, capstoneId])

  /* ======================
     FETCH TRELLO CARD COUNT
  ====================== */
  useEffect(() => {
    if (!trelloBoardId || stage !== 2) return

    const fetchCount = async () => {
      const res = await fetch(
        `/api/trello/board-cards-count?boardId=${trelloBoardId}`
      )
      const data = await res.json()
      setCardCount(data.count || 0)
    }

    fetchCount()
    const interval = setInterval(fetchCount, 5000)
    return () => clearInterval(interval)
  }, [trelloBoardId, stage])

  /* ======================
     STAGE 1 UPLOAD
  ====================== */
  const handleUpload = async () => {
    if (!file) return alert('Select a file')

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const ext = file.name.split('.').pop()
    const path = `${capstoneId}/${user!.id}/requirement.${ext}`

    await supabase.storage
      .from('capstone-requirements')
      .upload(path, file, { upsert: true })

    const { data: url } = supabase.storage
      .from('capstone-requirements')
      .getPublicUrl(path)

    await supabase.from('requirement_documents').upsert(
      {
        student_id: user!.id,
        capstone_id: capstoneId,
        file_url: url.publicUrl,
        approved: false,
      },
      { onConflict: 'student_id,capstone_id' }
    )

    await supabase
      .from('student_capstone_progress')
      .update({ submitted_for_review: true })
      .eq('student_id', user!.id)
      .eq('capstone_id', capstoneId)

    setSubmitted(true)
    setApproved(false)
    setLoading(false)
  }

  /* ======================
     STAGE 2 SUBMIT
  ====================== */
  const submitStage2 = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('student_capstone_progress')
      .update({ submitted_for_review: true })
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)

    setSubmittedForReview(true)
  }

  /* ======================
     STAGE 3 FILE SUBMIT
  ====================== */
  const submitStage3 = async () => {
    if (files.length === 0) return alert('Select files')

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    for (const file of files) {
      const path = `${capstoneId}/${user!.id}/stage3/${Date.now()}-${file.name}`
      await supabase.storage
        .from('capstone-submissions')
        .upload(path, file)
    }

    await supabase
      .from('student_capstone_progress')
      .update({ submitted_for_review: true })
      .eq('student_id', user!.id)
      .eq('capstone_id', capstoneId)

    setSubmittedForReview(true)
    setLoading(false)
  }

  if (!allowed) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* ================= STAGE 1 ================= */}
      {stage === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage 1: Requirement Gathering</CardTitle>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
                <Button onClick={handleUpload} disabled={loading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Requirement
                </Button>
              </>
            ) : approved ? (
              <p className="text-green-600 flex gap-2">
                <CheckCircle className="w-4 h-4" /> Approved
              </p>
            ) : (
              <p className="text-orange-600 flex gap-2">
                <Lock className="w-4 h-4" /> Waiting for teacher approval
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 2 ================= */}
      {stage === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage 2: Backlog Creation</CardTitle>
            <CardDescription>
              Minimum 10 Trello cards required
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {trelloUrl && (
              <Button
                className="w-full"
                onClick={() => window.open(trelloUrl, '_blank')}
              >
                Access Your Trello Board
              </Button>
            )}

            <div className="text-sm">
              Backlogs created: <b>{cardCount}/10</b>
            </div>

            {!submittedForReview ? (
              <Button
                className="w-full"
                disabled={cardCount < 10}
                onClick={submitStage2}
              >
                Submit for Review
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <Lock className="w-4 h-4" />
                Submitted for review. Waiting for teacher approval.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 3 ================= */}
      {stage === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage 3: GitHub Development</CardTitle>
            <CardDescription>
              Push code & submit build files
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() =>
                window.open('https://github.com/ReadNRevise', '_blank')
              }
            >
              <Github className="w-4 h-4 mr-2" />
              Go to GitHub Repository
            </Button>

            {!submittedForReview ? (
              <>
                <input
                  type="file"
                  multiple
                  onChange={e =>
                    setFiles(Array.from(e.target.files || []))
                  }
                />
                <Button
                  className="w-full"
                  onClick={submitStage3}
                  disabled={loading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Files for Approval
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <Lock className="w-4 h-4" />
                Submitted for review. Waiting for teacher approval.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
