import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useCapstoneStage(capstoneId: string, stage: number) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [trelloUrl, setTrelloUrl] = useState<string | null>(null)
  const [trelloBoardId, setTrelloBoardId] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [trelloRequested, setTrelloRequested] = useState(false)
  const [stage2Submitted, setStage2Submitted] = useState(false)
  const [stage3Submitted, setStage3Submitted] = useState(false)
  const [certificateRequested, setCertificateRequested] = useState(false)
  const [certificateIssued, setCertificateIssued] = useState(false)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAllowed(false)
      return
    }

    const { data: progress } = await supabase
      .from('student_capstone_progress')
      .select('*')
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
      .maybeSingle()

    if (!progress) {
      await supabase.from('student_capstone_progress').insert({
        student_id: user.id,
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

    // Access Guard
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

    // Set States
    setCertificateRequested(!!progress.certificate_requested)
    setCertificateIssued(!!progress.certificate_issued)
    if (progress.trello_board_url && progress.trello_board_id) {
      setTrelloUrl(progress.trello_board_url)
      setTrelloBoardId(progress.trello_board_id)
      setTrelloRequested(true)
    } else {
      setTrelloRequested(false)
    }
    setStage2Submitted(!!progress.stage2_submitted)
    setStage3Submitted(!!progress.stage3_submitted)

    if (stage === 1) {
      setSubmitted(!!progress.stage1_submitted)
      setApproved(!!progress.stage1_approved)
    }
    setAllowed(true)
  }

  useEffect(() => { load() }, [stage, capstoneId])

  // Trello Card Count
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

  const handleStage1Upload = async (file: File) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const ext = file.name.split('.').pop()
    const path = `${capstoneId}/${user.id}/requirement.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('capstone-requirements')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    const { data: url } = supabase.storage.from('capstone-requirements').getPublicUrl(path)

    await supabase.from('requirement_documents').upsert({
      student_id: user.id,
      capstone_id: capstoneId,
      file_url: url.publicUrl,
      approved: false,
    }, { onConflict: 'student_id,capstone_id' })

    await supabase.from('student_capstone_progress').upsert({
      student_id: user.id,
      capstone_id: capstoneId,
      stage1_submitted: true,
      current_stage: 1,
    }, { onConflict: 'student_id,capstone_id' })

    setSubmitted(true)
    setApproved(false)
    setLoading(false)
  }

  const requestTrello = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Login required')

    const { data: existing } = await supabase
      .from('trello_access_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) return alert('Access request already sent')

    const { error } = await supabase.from('trello_access_requests').insert({
      student_id: user.id,
      capstone_id: capstoneId,
      status: 'pending',
    })

    if (error) alert('Failed to send request')
  }

  const submitStage2Review = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('student_capstone_progress')
      .update({ stage2_submitted: true, current_stage: 3 })
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
    setStage2Submitted(true)
  }

  const handleStage3Upload = async (files: File[]) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    for (const file of files) {
      const path = `${capstoneId}/${user.id}/stage3/${Date.now()}-${file.name}`
      await supabase.storage.from('capstone-submissions').upload(path, file)
    }

    await supabase.from('student_capstone_progress').update({
      stage3_submitted: true,
      current_stage: 3,
      certificate_requested: false,
      certificate_issued: false
    }).eq('student_id', user.id).eq('capstone_id', capstoneId)

    setStage3Submitted(true)
    setLoading(false)
  }

  const requestCertificate = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('student_capstone_progress')
      .update({ certificate_requested: true })
      .eq('student_id', user.id)
      .eq('capstone_id', capstoneId)
    setCertificateRequested(true)
  }

  return {
    allowed, loading, submitted, approved, trelloUrl, trelloRequested,
    stage2Submitted, stage3Submitted, cardCount, certificateRequested, certificateIssued,
    handleStage1Upload, requestTrello, submitStage2Review, handleStage3Upload, requestCertificate
  }
}
