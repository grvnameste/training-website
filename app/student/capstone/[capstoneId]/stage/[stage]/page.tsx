
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


  const [studentLabel, setStudentLabel] = useState<string | null>(null)


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
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // ✅ STEP 1: STUDENT LABEL GENERATE (YAHI KARNA THA)
    const label = `student-${user.id.slice(0, 8)}`
    setStudentLabel(label)

    // ✅ STEP 2: PROGRESS LOAD
    const { data: progress } = await supabase
      .from('student_capstone_progress')
      .select('trello_board_url, trello_board_id, submitted_for_review')
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
      .maybeSingle()

    if (progress) {
      if (progress.trello_board_url && progress.trello_board_id) {
        setTrelloUrl(progress.trello_board_url)
        setTrelloBoardId(progress.trello_board_id)
      }

      setSubmittedForReview(!!progress.submitted_for_review)
    }

    // Stage 1 logic (unchanged)
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
    setAllowed(true)

  }

  load()
}, [stage, capstoneId])





  /* ================= INIT TRELLO ================= */
  useEffect(() => {
    if (stage !== 2) return
    if (trelloBoardId) return
  
    const boardId =
      process.env.NEXT_PUBLIC_TRELLO_BOARD_ID || 'V5iqYo6a'
  
    setTrelloBoardId(boardId)
    setTrelloUrl(`https://trello.com/b/${boardId}/capstoneproject`)
  }, [stage, trelloBoardId])
  

  /* ================= TRELLO COUNT ================= */
useEffect(() => {
  if (!trelloBoardId || !studentLabel || stage !== 2) return

  const fetchCount = async () => {
    const res = await fetch(
      `/api/trello/board-cards-count?boardId=${trelloBoardId}&label=${studentLabel}`
    )
    const data = await res.json()
    setCardCount(data.count || 0)
  }

  fetchCount()
  const interval = setInterval(fetchCount, 5000)
  return () => clearInterval(interval)
}, [trelloBoardId, studentLabel, stage])


  /* ================= ACTIONS ================= */
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

  const submitStage3 = async () => {
    if (files.length === 0) return alert('Select files')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    for (const file of files) {
      const path = `${capstoneId}/${user!.id}/stage3/${Date.now()}-${file.name}`
      await supabase.storage.from('capstone-submissions').upload(path, file)
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
        <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 bg-slate-50 text-slate-900">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* ================= STAGE 1 ================= */}
      {stage === 1 && (
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Stage 1: Requirement Gathering
            </CardTitle>
            <CardDescription>
              Upload your requirement document for teacher approval
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {!submitted ? (
              <>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition">
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm">
                    <span className="text-blue-600 font-medium">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </p>
                  <p className="text-xs text-slate-500">
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
                  <p className="text-sm text-blue-600">
                    Selected: {file.name}
                  </p>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Requirement
                </Button>
              </>
            ) : approved ? (
              <p className="flex gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Approved by Teacher
              </p>
            ) : (
              <p className="flex gap-2 text-yellow-600">
                <Lock className="w-4 h-4" />
                Pending Teacher Approval
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 2 ================= */}
      {stage === 2 && (
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-blue-600" />
              Stage 2: Backlog Creation
            </CardTitle>
            <CardDescription>
              Create minimum 10 Trello tasks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
  {/* STEP 1: Always show Trello access */}
  {trelloUrl && (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() => window.open(trelloUrl, '_blank')}
    >
      Access Trello Board
    </Button>
  )}

  {/* STEP 2: Show progress only after Trello exists */}
  {trelloBoardId && (
    <p className="text-sm">
      Tasks created:{' '}
      <b className="text-blue-600">{cardCount}/10</b>
    </p>
  )}

  {/* STEP 3: Submission logic */}
  {!submittedForReview ? (
    <Button
      className="w-full"
      disabled={cardCount < 10}
      onClick={submitStage2}
    >
      Submit for Review
    </Button>
  ) : (
    <p className="flex gap-2 text-yellow-600 text-sm">
      <Lock className="w-4 h-4" />
      Waiting for teacher approval
    </p>
  )}
</CardContent>

        </Card>
      )}

      {/* ================= STAGE 3 ================= */}
      {stage === 3 && (
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              Stage 3: Development & Submission
            </CardTitle>
            <CardDescription>
              Push code to GitHub & upload build files
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <Button
              className="w-full"
              onClick={() =>
                window.open('https://github.com/ReadNRevise', '_blank')
              }
            >
              <Github className="w-4 h-4 mr-2" />
              Open GitHub Repository
            </Button>

            {!submittedForReview ? (
              <>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition">
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm">
                    <span className="text-blue-600 font-medium">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </p>
                  <p className="text-xs text-slate-500">
                    Multiple files allowed
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e =>
                      setFiles(Array.from(e.target.files || []))
                    }
                  />
                </label>

                {files.length > 0 && (
                  <p className="text-sm text-blue-600">
                    {files.length} file(s) selected
                  </p>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={submitStage3}
                  disabled={loading}
                >
                  Submit for Approval
                </Button>
              </>
            ) : (
              <p className="flex gap-2 text-yellow-600 text-sm">
                <Lock className="w-4 h-4" />
                Waiting for teacher approval
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
