//app/teacher/capstone/trello-approvals/page.tsx
'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type TrelloRequest = {
  id: string
  student_id: string
  capstone_id: string
  status: string
  created_at: string

  student_name?: string
  capstone_title?: string
}


export default function TrelloApprovalsPage() {
  const [requests, setRequests] = useState<TrelloRequest[]>([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD REQUESTS ================= */
  const loadRequests = async () => {
    try {
      setLoading(true)
  
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
  
      /* ========== FETCH REQUESTS ========== */
      const { data: requestsData, error } = await supabase
        .from('trello_access_requests')
        .select('id, student_id, capstone_id, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
  
      if (error || !requestsData) {
        console.error(error)
        return
      }
  
      /* ========== COLLECT IDS ========== */
      const studentIds = Array.from(
        new Set(requestsData.map(r => r.student_id))
      )
  
      const capstoneIds = Array.from(
        new Set(requestsData.map(r => r.capstone_id))
      )
  
      /* ========== FETCH STUDENT NAMES ========== */
      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, name')
        .in('id', studentIds)
  
      const studentMap =
        students?.reduce<Record<string, string>>((acc, s) => {
          acc[s.id] = s.name
          return acc
        }, {}) ?? {}
  
      /* ========== FETCH CAPSTONE TITLES ========== */
      const { data: capstones } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', capstoneIds)
  
      const capstoneMap =
        capstones?.reduce<Record<string, string>>((acc, c) => {
          acc[c.id] = c.title
          return acc
        }, {}) ?? {}
  
      /* ========== MERGE FINAL DATA ========== */
      const finalRequests: TrelloRequest[] = requestsData.map(r => ({
        ...r,
        student_name: studentMap[r.student_id] ?? 'Unknown Student',
        capstone_title: capstoneMap[r.capstone_id] ?? 'Unknown Capstone',
      }))
  
      setRequests(finalRequests)
    } finally {
      setLoading(false)
    }
  }
  

  useEffect(() => {
    loadRequests()
  }, [])

  /* ================= APPROVE ================= */
  const approveAccess = async (req: TrelloRequest) => {
    try {
      const res = await fetch('/api/trello/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: req.student_id,
          capstone_id: req.capstone_id,
        }),
      })

      if (!res.ok) {
        alert('Trello invite failed ❌')
        return
      }

      await supabase
        .from('trello_access_requests')
        .update({ status: 'approved' })
        .eq('id', req.id)

      alert('Trello access approved ✅')
      loadRequests()
    } catch (err) {
      console.error(err)
      alert('Something went wrong ❌')
    }
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Trello access requests…
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No pending Trello access requests 🎉
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">
        Trello Access Requests
      </h1>

      {requests.map(req => (
        <Card
          key={req.id}
          className="p-4 flex justify-between items-center"
        >
          <div className="text-sm space-y-1">
          <p>
  <b>Student:</b> {req.student_name}
</p>
<p>
  <b>Capstone:</b> {req.capstone_title}
</p>

            <p className="text-xs text-muted-foreground">
              Requested on:{' '}
              {new Date(req.created_at).toLocaleString()}
            </p>
          </div>

          <Button onClick={() => approveAccess(req)}>
            Approve Access
          </Button>
        </Card>
      ))}
    </div>
  )
}
