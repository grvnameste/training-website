'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/* ======================
   TYPES
====================== */
interface ApprovalItem {
  id: string
  student_id: string
  capstone_id: string
  title: string
}

export default function CapstoneApprovals() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      /* 🔐 AUTH */
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      /* 1️⃣ TEACHER COURSES */
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', user.id)

      if (!courses || courses.length === 0) {
        setLoading(false)
        return
      }

      const courseIds = courses.map(c => c.id)

      /* 2️⃣ REQUIREMENT DOCUMENTS */
      const { data } = await supabase
        .from('requirement_documents')
        .select(`
          id,
          student_id,
          capstone_id,
          capstone_projects (
            title,
            course_id
          )
        `)
        .eq('approved', false)

      /* 3️⃣ NORMALIZE + TYPE SAFE FILTER */
      const normalized: ApprovalItem[] = (data ?? [])
        .map((row: any) => {
          const capstone = Array.isArray(row.capstone_projects)
            ? row.capstone_projects[0]
            : row.capstone_projects

          if (!capstone) return null
          if (!courseIds.includes(capstone.course_id))
            return null

          return {
            id: row.id,
            student_id: row.student_id,
            capstone_id: row.capstone_id,
            title: capstone.title,
          }
        })
        .filter(
          (item): item is ApprovalItem => item !== null
        )

      setItems(normalized)
      setLoading(false)
    }

    load()
  }, [])

  /* ======================
     APPROVE ACTION
  ====================== */
  const approve = async (
    requirementId: string,
    capstoneId: string,
    studentId: string,
    title: string
  ) => {
    const res = await fetch('/api/capstone/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirementId,
        capstoneId,
        studentId,
        projectName: title,
      }),
    })

    if (!res.ok) {
      alert('Approval failed ❌')
      return
    }

    alert('Approved & Trello board created ✅')
    location.reload()
  }

  /* ======================
     UI
  ====================== */
  if (loading) {
    return (
      <div className="text-center py-10">
        Loading approvals…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        No pending approvals 🎉
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">
        Capstone Approvals
      </h1>

      {items.map(item => (
        <Card
          key={item.id}
          className="p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              Student ID: {item.student_id}
            </p>
          </div>

          <Button
            onClick={() =>
              approve(
                item.id,
                item.capstone_id,
                item.student_id,
                item.title
              )
            }
          >
            Approve & Create Trello
          </Button>
        </Card>
      ))}
    </div>
  )
}
