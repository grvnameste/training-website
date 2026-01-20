'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ApprovalItem {
  progress_id: string
  student_id: string
  capstone_id: string
  title: string
  current_stage: number
  requirement_url: string | null
  trello_board_url: string | null
  stage3_files?: {
    id: string
    file_name: string
    file_url: string
    approved: boolean
  }[]
}

export default function CapstoneApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)

      /* ================= AUTH ================= */
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      /* ============ TEACHER COURSES ============ */
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', user.id)

      const courseIds = courses?.map(c => c.id) ?? []
      if (!courseIds.length) {
        setItems([])
        return
      }

      /* ============ CAPSTONES ============ */
      const { data: capstones } = await supabase
        .from('capstone_projects')
        .select('id, title, course_id')
        .in('course_id', courseIds)

      /* ============ STAGE 1 (Requirements) ============ */
      const { data: stage1 } = await supabase
        .from('requirement_documents')
        .select('student_id, capstone_id, file_url, approved')
        .eq('approved', false)

      /* ============ STAGE 2 & 3 (Progress) ============ */
      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select(
          'id, student_id, capstone_id, stage2_submitted, stage3_submitted, trello_board_url'
        )

      /* ============ STAGE 3 FILES ============ */
      const { data: stage3Files } = await supabase
        .from('stage3_submissions')
        .select('id, student_id, capstone_id, file_name, file_url, approved')

      const merged: ApprovalItem[] = []

      /* ========= MERGE STAGE 1 ========= */
      for (const r of stage1 ?? []) {
        const cap = capstones?.find(c => c.id === r.capstone_id)
        if (!cap || !courseIds.includes(cap.course_id)) continue

        merged.push({
          progress_id: `stage1-${r.student_id}-${r.capstone_id}`,
          student_id: r.student_id,
          capstone_id: r.capstone_id,
          title: cap.title,
          current_stage: 1,
          requirement_url: r.file_url,
          trello_board_url: null,
          stage3_files: [],
        })
      }

      /* ========= MERGE STAGE 2 & 3 ========= */
      for (const p of progress ?? []) {
        const cap = capstones?.find(c => c.id === p.capstone_id)
        if (!cap || !courseIds.includes(cap.course_id)) continue

        if (p.stage2_submitted) {
          merged.push({
            progress_id: p.id,
            student_id: p.student_id,
            capstone_id: p.capstone_id,
            title: cap.title,
            current_stage: 2,
            requirement_url: null,
            trello_board_url: p.trello_board_url,
            stage3_files: [],
          })
        }

        if (p.stage3_submitted) {
          const files =
            stage3Files?.filter(
              f =>
                f.student_id === p.student_id &&
                f.capstone_id === p.capstone_id
            ) ?? []

          merged.push({
            progress_id: p.id,
            student_id: p.student_id,
            capstone_id: p.capstone_id,
            title: cap.title,
            current_stage: 3,
            requirement_url: null,
            trello_board_url: null,
            stage3_files: files,
          })
        }
      }

      setItems(merged)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (item: ApprovalItem) => {
    const res = await fetch('/api/capstone/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    if (!res.ok) {
      alert('Approval failed ❌')
      return
    }

    alert(`Stage ${item.current_stage} approved ✅`)
    load()
  }

  if (loading) {
    return <div className="text-center py-10">Loading…</div>
  }

  if (!items.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No pending approvals 🎉
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Capstone Approvals</h1>

      {items.map(item => (
        <Card key={item.progress_id} className="p-4 space-y-3">
          <p className="font-medium">{item.title}</p>
          <p className="text-sm">Student ID: {item.student_id}</p>
          <p className="text-sm">
            Current Stage: <b>{item.current_stage}</b>
          </p>

          {item.current_stage === 1 && (
            <>
              <a
                href={item.requirement_url!}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                View Requirement Document
              </a>
              <Button onClick={() => approve(item)}>
                Approve Stage 1
              </Button>
            </>
          )}

          {item.current_stage === 2 && (
            <>
              <a
                href={item.trello_board_url!}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                View Trello Board
              </a>
              <Button onClick={() => approve(item)}>
                Approve Stage 2
              </Button>
            </>
          )}

          {item.current_stage === 3 && (
            <>
              {item.stage3_files?.map(f => (
                <a
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  className="block text-blue-600 underline text-sm"
                >
                  ⬇️ {f.file_name}
                </a>
              ))}
              <Button onClick={() => approve(item)}>
                Approve Stage 3
              </Button>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}
