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

      const { data, error } = await supabase
        .from('trello_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        return
      }

      setRequests(data || [])
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
              <b>Student ID:</b> {req.student_id}
            </p>
            <p>
              <b>Capstone ID:</b> {req.capstone_id}
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
