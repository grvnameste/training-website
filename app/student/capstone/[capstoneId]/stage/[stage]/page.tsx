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
  FileText,
  KanbanSquare,
  Code2,
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

  /* ================= ACCESS GUARD ================= */
  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')

      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select('current_stage, submitted_for_review')
        .eq('student_id', user.id)
        .eq('capstone_id', capstoneId)
        .maybeSingle()

      if (!progress) return router.replace('/student/dashboard')

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

  /* ================= LOAD DATA ================= */
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

  /* ================= TRELLO COUNT ================= */
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
        <div className="h-8 w-8 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 text-white">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-white/70 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* ================= STAGE 1 ================= */}
      {/* ================= STAGE 1 ================= */}
      {stage === 1 && (
        <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur">
          <CardHeader className="bg-white/10 border-b border-white/10 rounded-t-3xl">
            <CardTitle className="flex items-center gap-2 text-white font-semibold">
              <FileText className="w-5 h-5 text-teal-300" />
              Stage 1: Requirement Gathering
            </CardTitle>
            <CardDescription className="text-white/70">
              Upload your requirement document for teacher approval
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {!submitted ? (
              <>
                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition">
                  <Upload className="w-10 h-10 text-teal-400 mb-3" />
                  <p className="text-sm text-white/90">
                    <span className="text-teal-300 font-medium">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    PDF / DOC / DOCX allowed
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={e =>
                      setFile(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {file && (
                  <p className="text-sm text-teal-300">
                    Selected file: {file.name}
                  </p>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-teal-400 text-black hover:bg-teal-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Requirement
                </Button>
              </>
            ) : approved ? (
              <p className="flex gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                Approved by Teacher
              </p>
            ) : (
              <p className="flex gap-2 text-yellow-400">
                <Lock className="w-4 h-4" />
                Pending Teacher Approval
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 2 ================= */}
      {/* ================= STAGE 2 ================= */}
      {stage === 2 && (
        <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur">
          <CardHeader className="bg-white/10 border-b border-white/10 rounded-t-3xl">
            <CardTitle className="flex items-center gap-2 text-white font-semibold">
              <KanbanSquare className="w-5 h-5 text-teal-300" />
              Stage 2: Backlog Creation
            </CardTitle>
            <CardDescription className="text-white/70">
              Create minimum 10 Trello tasks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {trelloUrl && (
              <Button
                className="w-full"
                onClick={() => window.open(trelloUrl, '_blank')}
              >
                Open Trello Board
              </Button>
            )}

            <p className="text-sm">
              Tasks created:{' '}
              <b className="text-teal-300">{cardCount}/10</b>
            </p>

            {!submittedForReview ? (
              <Button
                className="w-full"
                disabled={cardCount < 10}
                onClick={submitStage2}
              >
                Submit for Review
              </Button>
            ) : (
              <p className="flex gap-2 text-yellow-400 text-sm">
                <Lock className="w-4 h-4" />
                Waiting for teacher approval
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 3 ================= */}
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
