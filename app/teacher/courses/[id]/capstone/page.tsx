//app/teacher/courses/[id]/capstone/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowLeft, Trash2, Plus, Loader2 } from 'lucide-react'

/* =======================
   TYPES
======================= */
interface Capstone {
  id: string
  title: string
  description: string
}

/* =======================
   CONSTANTS
======================= */
const SDLC_STAGES = [
  'Requirement Gathering',
  'Requirement Clarification & Approval',
  'System Design',
  'Development',
  'Testing',
  'Deployment',
  'Retrospective',
]

export default function TeacherCapstonePage() {
  const { id: courseId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [capstone, setCapstone] = useState<Capstone | null>(null)
  /* =======================
     LOAD CAPSTONE
  ======================= */
  useEffect(() => {
    const loadCapstone = async () => {
      const { data } = await supabase
        .from('capstone_projects')
        .select('id, title, description')
        .eq('course_id', courseId)
        .maybeSingle()

      setCapstone(data || null)
      setLoading(false)
    }

    loadCapstone()
  }, [courseId])

  /* =======================
     ENABLE CAPSTONE
  ======================= */
  const enableCapstone = async () => {
    setActionLoading(true)

    try {
      /* 1️⃣ Create capstone */
      const { data: capstone, error } = await supabase
        .from('capstone_projects')
        .insert({
          course_id: courseId,
          title: 'Capstone Project',
          description:
            'Build a real-world project following SDLC methodology',
        })
        .select()
        .single()

      if (error || !capstone) throw error

      /* 2️⃣ Create SDLC stages */
      const stagesPayload = SDLC_STAGES.map((title, index) => ({
        capstone_id: capstone.id,
        title,
        order_index: index + 1,
      }))

      await supabase.from('capstone_stages').insert(stagesPayload)

      setCapstone(capstone)
      alert('✅ Capstone enabled successfully')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Failed to enable capstone')
    } finally {
      setActionLoading(false)
    }
  }

  /* =======================
     DISABLE CAPSTONE
  ======================= */
  const disableCapstone = async () => {
    if (!capstone) return
    if (!confirm('Disable capstone for this course?')) return

    setActionLoading(true)

    try {
      /* ⚠️ Order matters */
      await supabase
        .from('capstone_stages')
        .delete()
        .eq('capstone_id', capstone.id)

      await supabase
        .from('capstone_projects')
        .delete()
        .eq('id', capstone.id)

      setCapstone(null)
      alert('❌ Capstone disabled')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Failed to disable capstone')
    } finally {
      setActionLoading(false)
    }
  }

  /* =======================
     UI
  ======================= */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/teacher/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Capstone Project</CardTitle>
          <CardDescription>
            Manage capstone availability for this course
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!capstone && (
            <>
              <p className="text-sm text-muted-foreground">
                This course does not currently include a capstone project.
              </p>

              <Button
                onClick={enableCapstone}
                disabled={actionLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enable Capstone
              </Button>
            </>
          )}

          {capstone && (
            <>
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-semibold">{capstone.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {capstone.description}
                </p>

                <ul className="list-disc ml-5 text-sm text-muted-foreground">
                  {SDLC_STAGES.map(stage => (
                    <li key={stage}>{stage}</li>
                  ))}
                </ul>
              </div>

              <Button
                variant="destructive"
                onClick={disableCapstone}
                disabled={actionLoading}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disable Capstone
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
