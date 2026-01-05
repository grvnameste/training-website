//app/student/capstone/[capstoneId]/stage/[stage]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Upload, Lock } from 'lucide-react'

export default function CapstoneStagePage() {
  const params = useParams()
  const router = useRouter()

  const capstoneId = params.capstoneId as string
  const stage = Number(params.stage)

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  /* 🔍 Check if already submitted (SELECT policy required) */
  useEffect(() => {
    if (stage !== 1) return

    const checkSubmission = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('requirement_documents')
        .select('id')
        .eq('student_id', user.id)
        .eq('capstone_id', capstoneId)
        .maybeSingle()

      if (!error && data) {
        setSubmitted(true)
      }
    }

    checkSubmission()
  }, [capstoneId, stage])

  const handleUpload = async () => {
    if (!file) return alert('Please select a file')

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Not logged in')
      setLoading(false)
      return
    }

    try {
      /* 1️⃣ Upload to Supabase Storage */
      const ext = file.name.split('.').pop()
      const filePath = `${capstoneId}/${user.id}/requirement.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('capstone-requirements')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      /* 2️⃣ Get public URL */
      const { data: urlData } = supabase.storage
        .from('capstone-requirements')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate file URL')
      }

      /* 3️⃣ UPSERT with explicit conflict target (RLS SAFE) */
      const { error: dbError } = await supabase
        .from('requirement_documents')
        .upsert(
          {
            student_id: user.id,
            capstone_id: capstoneId,
            file_url: urlData.publicUrl,
            approved: false,
          },
          {
            onConflict: 'student_id,capstone_id',
          }
        )

      if (dbError) throw dbError

      alert('Requirement submitted. Waiting for approval ✅')
      setSubmitted(true)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Capstone Stage {stage}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {stage === 1 ? (
            submitted ? (
              <div className="flex items-center gap-2 text-orange-600">
                <Lock className="w-4 h-4" />
                Requirement submitted. Waiting for teacher approval.
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Upload Requirement Document (PDF / Word)
                </p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e =>
                    setFile(e.target.files?.[0] || null)
                  }
                />

                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'Uploading...' : 'Submit for Approval'}
                </Button>
              </>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Stage {stage} content coming soon…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
