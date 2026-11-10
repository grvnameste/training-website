//app/student/capstone/[capstoneId]/stage/[stage]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useCapstoneStage } from '@/hooks/useCapstoneStage'
import { Stage1Content } from '@/components/student/Stage1Content'
import { Stage2Content } from '@/components/student/Stage2Content'
import { Stage3Content } from '@/components/student/Stage3Content'

export default function CapstoneStagePage() {
  const params = useParams()
  const router = useRouter()
  const capstoneId = params.capstoneId as string
  const stage = Number(params.stage)

  const {
    allowed,
    loading,
    submitted,
    approved,
    stage2Submitted,
    stage3Submitted,
    certificateRequested,
    certificateIssued,
    handleStage1Upload,
    submitStage2Review,
    handleStage3Upload,
    requestCertificate
  } = useCapstoneStage(capstoneId, stage)
  if (!allowed) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => router.back()}>
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back
      </Button>

      {stage === 1 && (
        <Stage1Content
          submitted={submitted}
          approved={approved}
          loading={loading}
          onUpload={handleStage1Upload}
          onNext={() => router.push(`/student/capstone/${capstoneId}/stage/2`)}
        />
      )}

{stage === 2 && (
  <Stage2Content
    capstoneId={capstoneId}
    stage2Submitted={stage2Submitted}
    onSubmitReview={submitStage2Review}
  />
)}

      {stage === 3 && (
        <Stage3Content
          stage3Submitted={stage3Submitted}
          certificateRequested={certificateRequested}
          certificateIssued={certificateIssued}
          loading={loading}
          onUpload={handleStage3Upload}
          onRequestCertificate={requestCertificate}
          capstoneId={capstoneId}
        />
      )}
    </div>
  )
}
