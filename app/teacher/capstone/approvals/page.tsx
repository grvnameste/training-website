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
  student_name: string

  current_stage: number
  requirement_url: string | null
  trello_board_url: string | null

  stage2_approved?: boolean
  stage3_approved?: boolean

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
if (!user) {
  setItems([])
  setLoading(false)
  return
}

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
      const { data: capstonesData } = await supabase
      .from('courses')
      .select('id, title, parent_course_id')
      .eq('is_capstone', true)
      .in('parent_course_id', courseIds)
    
    const capstones = capstonesData ?? []
    
    if (!capstones.length) {
      setItems([])
      return
    }
    


      /* ============ STAGE 1 (Requirements) ============ */
      const { data: stage1 } = await supabase
  .from('requirement_documents')
  .select(`
    student_id,
    capstone_id,
    file_url
  `)
  .eq('approved', false)
  .in('capstone_id', capstones.map(c => c.id))

    
    

        
      /* ============ STAGE 2 & 3 (Progress) ============ */
      const { data: progress } = await supabase
      .from('student_capstone_progress')
      .select(
        `
        id,
        student_id,
        capstone_id,
        stage2_submitted,
        stage2_approved,
        stage3_submitted,
        stage3_approved,
        trello_board_url
        `
      )
      
      .in('capstone_id', capstones.map(c => c.id))
      


    
      /* ============ STAGE 3 FILES ============ */
      const { data: stage3Files } = await supabase
      .from('stage3_submissions')
      .select('id, student_id, capstone_id, file_name, file_url, approved')
      .in('capstone_id', capstones.map(c => c.id))
      

      const merged: ApprovalItem[] = []

      


      /* ========= MERGE STAGE 1 ========= */
      for (const r of stage1 ?? []) {
        const cap = capstones.find(c => c.id === r.capstone_id)
        if (!cap || !courseIds.includes(cap.parent_course_id)) continue
      
        merged.push({
          progress_id: `stage1-${r.student_id}-${r.capstone_id}`,
          student_id: r.student_id,
          student_name: '',
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
        if (!cap || !courseIds.includes(cap.parent_course_id)) continue

        if (p.stage2_submitted && !p.stage2_approved) {
          merged.push({
            progress_id: p.id,
            student_id: p.student_id,
            student_name: '',
            capstone_id: p.capstone_id,
            title: cap.title,
            current_stage: 2,
            requirement_url: null,
            trello_board_url: p.trello_board_url,
            stage3_files: [],
          })
          
        }

        if (p.stage3_submitted && !p.stage3_approved) {
          const files =
            stage3Files?.filter(
              f =>
                f.student_id === p.student_id &&
                f.capstone_id === p.capstone_id
            ) ?? []

            merged.push({
              progress_id: p.id,
              student_id: p.student_id,
              student_name: '',
              capstone_id: p.capstone_id,
              title: cap.title,
              current_stage: 3,
              requirement_url: null,
              trello_board_url: null,
              stage3_files: files,
            })
            
        }
      }
/* ============ COLLECT STUDENT IDS ============ */
const studentIds = new Set<string>()
merged.forEach(item => {
  studentIds.add(item.student_id)
})

/* ============ FETCH STUDENT NAMES ============ */
let studentMap: Record<string, string> = {}

if (studentIds.size > 0) {
  const { data: profiles } = await supabase
  .from('student_profiles')
  .select('id, name')
    .in('id', Array.from(studentIds))

  studentMap =
    profiles?.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name
      return acc
    }, {}) ?? {}
}

/* ============ FINAL ITEMS ============ */
const finalItems: ApprovalItem[] = merged.map(item => ({
  ...item,
  student_name: studentMap[item.student_id] ?? 'Unknown Student',
}))

setItems(finalItems)

      
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

      <div className="overflow-x-auto rounded-lg border">
  <table className="w-full border-collapse text-sm">
    <thead className="bg-slate-100 text-left">
      <tr>
        <th className="px-4 py-3 border">Capstone</th>
        <th className="px-4 py-3 border">Student</th>
        <th className="px-4 py-3 border">Stage</th>
        <th className="px-4 py-3 border">Details</th>
        <th className="px-4 py-3 border">Action</th>
      </tr>
    </thead>

    <tbody>
      {items.map(item => (
        <tr key={item.progress_id} className="hover:bg-slate-50">
          {/* Capstone */}
          <td className="px-4 py-3 border font-medium">
            {item.title}
          </td>

          {/* Student */}
          <td className="px-4 py-3 border">
            {item.student_name}
          </td>

          {/* Stage */}
          <td className="px-4 py-3 border">
            Stage {item.current_stage}
          </td>

          {/* Details */}
          <td className="px-4 py-3 border">
            {item.current_stage === 1 && item.requirement_url && (
              <a
                href={item.requirement_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                View Requirement
              </a>
            )}

            {item.current_stage === 2 && item.trello_board_url && (
              <a
                href={item.trello_board_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                View Trello
              </a>
            )}

            {item.current_stage === 3 &&
              item.stage3_files?.map(f => (
                <a
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  className="block text-blue-600 underline"
                >
                  {f.file_name}
                </a>
              ))}
          </td>

          {/* Action */}
          <td className="px-4 py-3 border">
            <Button
              size="sm"
              onClick={() => approve(item)}
            >
              Approve
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  )
}
