<<<<<<< HEAD
// hooks/useCapstoneStage.ts
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

interface CapstonePayload {
  progress: {
    currentStage: number
    stage1Submitted: boolean
    stage1Approved: boolean
    stage2Submitted: boolean
    stage2Approved: boolean
    stage3Submitted: boolean
    stage3Approved: boolean
    certificateRequested: boolean
    certificateIssued: boolean
    completed: boolean
  }
  board: { id: string; cardCount: number } | null
}

export function useCapstoneStage(capstoneId: string, stage: number) {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [cardCount, setCardCount] = useState(0)
  const [stage2Submitted, setStage2Submitted] = useState(false)
  const [stage3Submitted, setStage3Submitted] = useState(false)
  const [certificateRequested, setCertificateRequested] = useState(false)
  const [certificateIssued, setCertificateIssued] = useState(false)

  const load = useCallback(async () => {
    if (!isLoaded) return
    if (!user) {
      setAllowed(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/me/capstone/${capstoneId}`, { cache: 'no-store' })
      const data = (await res.json().catch(() => ({}))) as CapstonePayload & { error?: string }
      if (!res.ok) {
        setAllowed(false)
        return
      }

      const progress = data.progress
      if (progress.currentStage && stage > progress.currentStage) {
        router.replace(`/student/capstone/${capstoneId}/stage/${progress.currentStage}`)
        return
      }
      if (stage === 3 && progress.currentStage < 3) {
        router.replace(`/student/capstone/${capstoneId}/stage/2`)
        return
      }

      setSubmitted(!!progress.stage1Submitted)
      setApproved(!!progress.stage1Approved)
      setStage2Submitted(!!progress.stage2Submitted)
      setStage3Submitted(!!progress.stage3Submitted)
      setCertificateRequested(!!progress.certificateRequested)
      setCertificateIssued(!!progress.certificateIssued)
      setCardCount(data.board?.cardCount ?? 0)
      setAllowed(true)
    } catch (error) {
      console.error('Capstone load error:', error)
      setAllowed(false)
    } finally {
      setLoading(false)
    }
  }, [capstoneId, stage, user, isLoaded, router])

  useEffect(() => {
    void load()
  }, [load])

  const handleStage1Upload = useCallback(
    async (file: File) => {
      setLoading(true)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        const chunkSize = 0x8000
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
        }

        const res = await fetch('/api/student/stages/upload-requirement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            capstone_id: capstoneId,
            file_base64: btoa(binary),
            file_name: file.name,
          }),
        })
        const result = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(result?.error || 'Failed to upload requirement document')

        setSubmitted(true)
        toast.success('Requirement uploaded. Pending instructor approval.')
        await load()
      } catch (error: any) {
        toast.error(error?.message || 'Unexpected error during upload')
      } finally {
        setLoading(false)
      }
    },
    [capstoneId, load]
  )

  const submitStage2Review = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/me/capstone/${capstoneId}/stages/2/submit`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to submit Stage 2')
      setStage2Submitted(true)
      toast.success('Stage 2 backlog submitted for review')
      await load()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit Stage 2')
    } finally {
      setLoading(false)
    }
  }, [capstoneId, load])

  const handleStage3Upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        toast.error('Please select at least one file to submit')
        return
      }

      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('capstone_id', capstoneId)
        files.forEach((file) => formData.append('files', file))

        const res = await fetch('/api/student/stages/upload-stage3', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.error) throw new Error(data.error || 'Failed to upload deliverables')

        setStage3Submitted(true)
        toast.success(`Submitted ${files.length} deliverable(s) for review`)
        await load()
      } catch (error: any) {
        toast.error(error?.message || 'Unexpected error during Stage 3 submission')
      } finally {
        setLoading(false)
      }
    },
    [capstoneId, load]
  )

  const requestCertificate = useCallback(async () => {
    try {
      const res = await fetch('/api/me/certificates/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capstoneId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to request certificate')
      setCertificateRequested(true)
      toast.success('Certificate request submitted')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to request certificate')
    }
  }, [capstoneId])

  return {
    allowed,
    loading,
    submitted,
    approved,
    stage2Submitted,
    stage3Submitted,
    cardCount,
    certificateRequested,
    certificateIssued,
    handleStage1Upload,
    submitStage2Review,
    handleStage3Upload,
    requestCertificate,
  }
}
=======
//hooks/useCastoneStage.ts
import { useEffect, useState, useCallback } from 'react'
import supabase from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"

export function useCapstoneStage(capstoneId: string, stage: number) {
  const router = useRouter()
  const { user } = useUser()

  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmit] = useState(false)
  const [approved, setApproved] = useState(false)
  const [trelloUrl, setTrelloUrl] = useState<string | null>(null)
  const [trelloBoardId, setTrelloBoardId] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [trelloRequested, setTrelloRequested] = useState(false)
  const [stage2Submitted, setStage2Submitted] = useState(false)
  const [stage3Submitted, setStage3Submitted] = useState(false)
  const [certificateRequested, setCertificateRequested] = useState(false)
  const [certificateIssued, setCertificateIssued] = useState(false)

  // ✅ UUID helper
  const getUUID = async () => {
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (profile?.id) {
      console.log("EXISTING USER UUID:", profile.id)
      return profile.id
    }

    console.log("Creating new profile for user:", user.id)

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({ clerk_id: user.id })
      .select()
      .single()

    if (error) {
      console.log("PROFILE CREATE ERROR:", error)
      return null
    }

    console.log("NEW USER UUID:", newProfile.id)
    return newProfile.id
  }

  const load = async () => {
    setLoading(true)

    if (!user) {
      setAllowed(false)
      setLoading(false)
      return
    }

    const uuid = await getUUID()
    if (!uuid) {
      setAllowed(false)
      setLoading(false)
      return
    }

    const { data: progress } = await supabase
      .from('student_capstone_progress')
      .select('*')
      .eq('student_id', uuid)
      .eq('capstone_id', capstoneId)
      .maybeSingle()

    if (!progress) {
      await supabase.from('student_capstone_progress').insert({
        student_id: uuid,
        capstone_id: capstoneId,
        current_stage: 1,
        stage1_submitted: false,
        stage1_approved: false,
        stage2_submitted: false,
        stage2_approved: false,
        stage3_submitted: false,
        stage3_approved: false,
      })
      window.location.reload()
      return
    }

    if (progress.current_stage && stage > progress.current_stage) {
      router.replace(`/student/capstone/${capstoneId}/stage/${progress.current_stage}`)
      return
    }

    if (stage === 3 && progress.current_stage < 3) {
      router.replace(`/student/capstone/${capstoneId}/stage/2`)
      return
    }

    if (stage === 2 && progress.current_stage === 3) {
      router.replace(`/student/capstone/${capstoneId}/stage/3`)
      return
    }

    setCertificateRequested(!!progress.certificate_requested)
    setCertificateIssued(!!progress.certificate_issued)
    setStage2Submitted(!!progress.stage2_submitted)
    setStage3Submitted(!!progress.stage3_submitted)

    if (progress.trello_board_url && progress.trello_board_id) {
      setTrelloUrl(progress.trello_board_url)
      setTrelloBoardId(progress.trello_board_id)
      setTrelloRequested(true)
    } else {
      setTrelloRequested(false)
    }

    if (stage === 1) {
      setSubmit(!!progress.stage1_submitted)
      setApproved(!!progress.stage1_approved)
    }

    setAllowed(true)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [stage, capstoneId, user])

  // ✅ Trello count
  useEffect(() => {
    if (!trelloBoardId || stage !== 2) return

    const fetchCount = async () => {
      const res = await fetch(`/api/trello/board-cards-count?boardId=${trelloBoardId}`)
      const data = await res.json()
      setCardCount(data.count || 0)
    }

    fetchCount()
    const interval = setInterval(fetchCount, 5000)
    return () => clearInterval(interval)
  }, [trelloBoardId, stage])

  // ✅ STAGE 1 (FIXED)
  const handleStage1Upload = useCallback(async (file: File) => {
    console.log("HANDLE STAGE 1 UPLOAD CALLED")

    setLoading(true)

    const uuid = await getUUID()
    if (!uuid) {
      setLoading(false)
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64String = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      const payload = {
        student_id: uuid,
        capstone_id: capstoneId,
        file_base64: base64String,
        file_name: file.name
      }

      console.log("BEFORE FETCH")

      const res = await fetch('/api/student/stages/upload-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      console.log("API RESPONSE:", result)
      
      if (!res.ok) {
        console.log("UPLOAD FAILED ❌", result)
        setLoading(false)
        return
      }
      
  console.log("UPLOAD SUCCESS ✅")

// 🔥 ADD THIS (MOST IMPORTANT FIX)
const { data: updated, error: updateError } = await supabase
  .from('student_capstone_progress')
  .update({
    stage1_submitted: true
  })
  .eq('student_id', uuid)
  .eq('capstone_id', capstoneId)
  .select()

console.log("UPDATE RESULT:", updated)
console.log("UPDATE ERROR:", updateError)

// optional debug
const { data: afterUpdate } = await supabase
  .from('student_capstone_progress')
  .select('*')
  .eq('student_id', uuid)
  .eq('capstone_id', capstoneId)

console.log("AFTER UPDATE:", afterUpdate)

// -----------------------------

setSubmit(true)

// 🔥 reload fresh data
await load()

    } catch (err) {
      console.log("ERROR ❌", err)
    }

    setLoading(false)

  }, [capstoneId, user])



  // ✅ STAGE 2
  const submitStage2Review = async () => {
    const uuid = await getUUID()
    if (!uuid) return
  
    setLoading(true)
  
    try {
      const { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('student_id', uuid)
        .eq('capstone_id', capstoneId)
        .single()
  
      if (!board) {
        console.log("❌ No board found")
        setLoading(false)
        return
      }
  
      const { data: lists } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', board.id)
        .order('position')
  
      let cards: any[] = []
  
      if (lists && lists.length > 0) {
        const listIds = lists.map(l => l.id)
  
        const { data } = await supabase
          .from('cards')
          .select('*')
          .in('list_id', listIds)
  
        cards = data || []
      }
  
      const boardData = { board, lists, cards }
  
      await supabase.from('stage2_submissions').insert({
        student_id: uuid,
        capstone_id: capstoneId,
        board_id: board.id,
        board_data: boardData
      })
      
      console.log("🚀 STAGE 2 SUBMIT START")

      console.log("👤 UUID:", uuid)
      console.log("📦 CAPSTONE ID:", capstoneId)
      
      // check existing row
      const { data: existingRow } = await supabase
        .from('student_capstone_progress')
        .select('*')
        .eq('student_id', uuid)
        .eq('capstone_id', capstoneId)
      
      console.log("📊 EXISTING ROW:", existingRow)
      
      // UPDATE
      const { data: updateData, error: updateError } = await supabase
        .from('student_capstone_progress')
        .update({
          stage2_submitted: true
        })
        .eq('student_id', uuid)
        .eq('capstone_id', capstoneId)
        .select()
      
      console.log("📝 UPDATE RESULT:", updateData)
      console.log("❌ UPDATE ERROR:", updateError)
      
      // verify after update
      const { data: afterUpdate } = await supabase
        .from('student_capstone_progress')
        .select('*')
        .eq('student_id', uuid)
        .eq('capstone_id', capstoneId)
      
      console.log("✅ AFTER UPDATE:", afterUpdate)
    await load()
      // ✅ THIS IS ENOUGH
      setStage2Submitted(true)
  
    } catch (err) {
      console.log("❌ Stage 2 submit error:", err)
    }
  
    setLoading(false)
  }

  const handleStage3Upload = async (files: File[]) => {
    const file = files[0]
    if (!file) return
  
    const uuid = await getUUID()   // ✅ ADD THIS
    if (!uuid) return
  
    setLoading(true)
  
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64String = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
  
      const res = await fetch('/api/student/stages/upload-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: uuid, // ✅ NOW WORKS
          capstone_id: capstoneId,
          file_base64: base64String,
          file_name: file.name
        }),
      })
  
      const data = await res.json()
  
      if (data.error) {
        console.log("❌ Stage3 upload error:", data.error)
        setLoading(false)
        return
      }
  
      await supabase
        .from('student_capstone_progress')
        .update({ stage3_submitted: true }) // ⚠️ naam check kar
        .eq('student_id', uuid)
        .eq('capstone_id', capstoneId)
  
      setStage3Submitted(true)
  
    } catch (err) {
      console.log("❌ Stage3 error:", err)
    }
  
    setLoading(false)
  }
  // ✅ CERTIFICATE
  const requestCertificate = async () => {
    const uuid = await getUUID()
    if (!uuid) return

    await supabase
      .from('student_capstone_progress')
      .update({ certificate_requested: true })
      .eq('student_id', uuid)
      .eq('capstone_id', capstoneId)

    setCertificateRequested(true)
  }

  return {
    allowed,
    loading,
    submitted,
    approved,
    trelloUrl,
    trelloRequested,
    stage2Submitted,
    stage3Submitted,
    cardCount,
    certificateRequested,
    certificateIssued,
    handleStage1Upload,
    submitStage2Review,
    handleStage3Upload,
    requestCertificate
  }
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
