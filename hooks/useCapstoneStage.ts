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
