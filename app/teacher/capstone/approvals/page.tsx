//app/teacher/capstone/approvals/page.tsx
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
}

export default function CapstoneApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)

      /* ================= AUTH ================= */
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      /* ============ TEACHER COURSES ============ */
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', user.id)

      const courseIds = courses?.map(c => c.id) ?? []
      if (!courseIds.length) {
        setItems([])
        return setLoading(false)
      }

      /* ========= STUDENT PROGRESS (CORE) ========= */
      const { data: progressRows, error } = await supabase
        .from('student_capstone_progress')
        .select(
          'id, student_id, capstone_id, current_stage, trello_board_url'
        )
        .eq('submitted_for_review', true)

      if (error) {
        console.error('progress error', error)
        return setLoading(false)
      }

      if (!progressRows?.length) {
        setItems([])
        return setLoading(false)
      }

      /* ============ CAPSTONE PROJECTS ============ */
      const capstoneIds = progressRows.map(p => p.capstone_id)

      const { data: capstones } = await supabase
        .from('capstone_projects')
        .select('id, title, course_id')
        .in('id', capstoneIds)

      if (!capstones?.length) {
        setItems([])
        return setLoading(false)
      }

      /* ============ REQUIREMENTS (OPTIONAL) ============ */
      const { data: requirements } = await supabase
        .from('requirement_documents')
        .select('student_id, capstone_id, file_url')

      /* ================= MERGE ================= */
      const merged: ApprovalItem[] = []

      for (const row of progressRows) {
        const capstone = capstones.find(c => c.id === row.capstone_id)
        if (!capstone) continue
        if (!courseIds.includes(capstone.course_id)) continue

        const req = requirements?.find(
          r =>
            r.student_id === row.student_id &&
            r.capstone_id === row.capstone_id
        )

        merged.push({
          progress_id: row.id,
          student_id: row.student_id,
          capstone_id: row.capstone_id,
          title: capstone.title,
          current_stage: row.current_stage,
          requirement_url: req?.file_url ?? null,
          trello_board_url: row.trello_board_url ?? null,
        })
      }

      setItems(merged)
    } catch (err) {
      console.error('Approval load crash', err)
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
              {item.requirement_url && (
                <a
                  href={item.requirement_url}
                  target="_blank"
                  className="text-blue-600 underline text-sm"
                >
                  View Requirement Document
                </a>
              )}
              <Button onClick={() => approve(item)}>
                Approve Stage 1
              </Button>
            </>
          )}

          {item.current_stage === 2 && (
            <>
              {item.trello_board_url && (
                <a
                  href={item.trello_board_url}
                  target="_blank"
                  className="text-blue-600 underline text-sm"
                >
                  View Trello Board
                </a>
              )}
              <Button onClick={() => approve(item)}>
                Approve Stage 2
              </Button>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}
