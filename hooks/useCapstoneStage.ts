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