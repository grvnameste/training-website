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
  // const [submittedForReview, setSubmittedForReview] = useState(false)
  // ✅ STAGE-2 SPECIFIC STATES
const [trelloRequested, setTrelloRequested] = useState(false)
const [stage2Submitted, setStage2Submitted] = useState(false)
const [stage3Submitted, setStage3Submitted] = useState(false)



  /* ================= ACCESS GUARD ================= */
// ================= ACCESS GUARD =================
useEffect(() => {
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: progress } = await supabase
      .from('student_capstone_progress')
      .select(`
        current_stage,
        trello_board_url,
        trello_board_id,
        stage2_submitted,
        stage3_submitted
      `)
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
      .maybeSingle()

    // ✅ ONLY FUTURE STAGE BLOCK
    if (progress?.current_stage && stage > progress.current_stage) {
      router.replace(
        `/student/capstone/${capstoneId}/stage/${progress.current_stage}`
      )
      return
    }
  // 🔒 PAST STAGES → FORCE FINAL STATE
if (progress?.current_stage && stage < progress.current_stage) {
  setAllowed(true)

  if (stage === 1) {
    setSubmitted(true)
    setApproved(true)
  }

  if (stage === 2) {
    setStage2Submitted(true)
    setTrelloRequested(true)
  }

  if (stage === 3) {
    setStage3Submitted(true)
  }

  return
}



    if (progress) {
      if (progress.trello_board_url && progress.trello_board_id) {
        setTrelloUrl(progress.trello_board_url)
        setTrelloBoardId(progress.trello_board_id)
        setTrelloRequested(true)
      }

      setStage2Submitted(!!progress.stage2_submitted)
      setStage3Submitted(!!progress.stage3_submitted)
    }

    // Stage 1 data
    if (stage === 1) {
      const { data } = await supabase
        .from('requirement_documents')
        .select('approved, file_url')
        .eq('student_id', user.id)
        .eq('capstone_id', capstoneId)
        .maybeSingle()

        if (data?.file_url) {
          setSubmitted(true)          // 🔒 permanently submitted
          setApproved(!!data.approved)
        }
        
    }

    setAllowed(true)
  }

  load()
}, [stage, capstoneId])






  /* ================= INIT TRELLO ================= */
  // useEffect(() => {
  //   if (stage !== 2) return
  //   if (trelloBoardId) return
  
  //   const boardId =
  //     process.env.NEXT_PUBLIC_TRELLO_BOARD_ID || 'V5iqYo6a'
  
  //   setTrelloBoardId(boardId)
  //   setTrelloUrl(`https://trello.com/b/${boardId}/capstoneproject`)
  // }, [stage, trelloBoardId])
  

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
  


  /* ================= ACTIONS ================= */
  const handleUpload = async () => {
    if (!file) return alert('Select a file')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
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
    .update({
      stage1_submitted: true,
      current_stage: 2
    })
        .eq('student_id', user!.id)
    .eq('capstone_id', capstoneId)
  

    setSubmitted(true)
    setApproved(false)
    setLoading(false)
  }

  // const submitStage2 = async () => {
  //   const { data: { user } } = await supabase.auth.getUser()
  //   if (!user) return

  //   await supabase
  //     .from('student_capstone_progress')
  //     .update({ submitted_for_review: true })
  //     .eq('student_id', user.id)
  //     .eq('capstone_id', capstoneId)

  //   setSubmittedForReview(true)
  // }

  const requestTrelloAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    // ✅ DUPLICATE REQUEST BLOCK
    const { data: existing } = await supabase
      .from('trello_access_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
      .eq('status', 'pending')
      .maybeSingle()
  
    if (existing) {
      alert('Access request already sent')
      return
    }
  
    const { error } = await supabase
      .from('trello_access_requests')
      .insert({
        student_id: user.id,
        capstone_id: capstoneId,
        status: 'pending',
      })
  
    if (error) {
      console.error(error)
      alert('Failed to send request')
      return
    }
  
    // setSubmittedForReview(true)
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
      .update({
        stage3_submitted: true,
        current_stage: 3
      })
            .eq('student_id', user!.id)
      .eq('capstone_id', capstoneId)

      setStage3Submitted(true)
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
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Stage 1: Requirement Gathering
            </CardTitle>
            <CardDescription>
  Upload your requirement document for admin approval
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
  disabled={loading || submitted}
  className="disabled:pointer-events-none disabled:opacity-50"
>

                  Submit Requirement
                </Button>
              </>
            ) : approved ? (
              <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
                <CheckCircle className="w-4 h-4" />
                Stage 1 approved by teacher
              </div>
            
              <p className="text-sm text-slate-600">
                You submitted the requirement document and it has been approved.
                This stage is now locked for editing.
              </p>
            
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() =>
                  router.push(`/student/capstone/${capstoneId}/stage/2`)
                }
              >
                Go to Stage 2
              </Button>
            </div>
            
            
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
              <Lock className="w-4 h-4" />
              Pending Admin Approval
            </div>
            
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= STAGE 2 ================= */}
      {stage === 2 && (
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
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

{/* ================= BEFORE SUBMIT ================= */}
{!stage2Submitted && (
  <>
    {trelloUrl && (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => window.open(trelloUrl, '_blank')}
      >
        Open Trello Board
      </Button>
    )}

    {!trelloRequested ? (
      <Button
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        onClick={requestTrelloAccess}
      >
        Request Access
      </Button>
    ) : (
      <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-sm">
        <CheckCircle className="w-4 h-4" />
        Trello access granted by admin
      </div>
    )}

    <p className="text-sm">
      Tasks created: <b>{cardCount}/10</b>
    </p>

    {trelloRequested && cardCount >= 10 && (
      <Button
      disabled={stage2Submitted}
      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:pointer-events-none disabled:opacity-50"
      onClick={async () => {
    
          const { data: { user } } = await supabase.auth.getUser()
          await supabase
            .from('student_capstone_progress')
            .update({
              stage2_submitted: true,
              current_stage: 3
            })
            
                        .eq('student_id', user!.id)
            .eq('capstone_id', capstoneId)

          setStage2Submitted(true)
        }}
      >
        Submit Stage 2 for Review
      </Button>
    )}
  </>
)}

{/* ================= AFTER SUBMIT ================= */}
{stage2Submitted && (
  <div className="space-y-3">
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
      <CheckCircle className="w-4 h-4" />
      Stage 2 already submitted
    </div>

    <p className="text-sm text-slate-600">
      Backlog has been submitted for review.
      You cannot submit this stage again.
    </p>

    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() =>
        router.push(`/student/capstone/${capstoneId}/stage/3`)
      }
    >
      Go to Stage 3
    </Button>
  </div>
)}

</CardContent>



        </Card>
      )}

      {/* ================= STAGE 3 ================= */}
      {stage === 3 && (
        <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
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

            {!stage3Submitted ? (

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
  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:pointer-events-none disabled:opacity-50"
  onClick={submitStage3}
  disabled={loading || stage3Submitted}
>

                  Submit for Approval
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
              <Lock className="w-4 h-4" />
              Pending Admin Approval
            </div>
            
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
