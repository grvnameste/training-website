import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

export interface ApprovalItem {
  progress_id: string
  student_id: string
  capstone_id: string
  title: string
  student_name: string
  current_stage: number
  requirement_url: string | null
  stage2_approved?: boolean
  stage3_approved?: boolean
  stage3_files?: {
    id: string
    file_name: string
    file_url: string
    approved: boolean
  }[]
  meeting?: any
}

export function useCapstoneApprovals() {
  const { user } = useUser()
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/instructor/capstone/approvals', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not load approvals')
      setItems(data.items ?? [])
    } catch (error: any) {
      console.error('Approvals load failed:', error)
      toast.error(error?.message || 'Could not load approvals')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const approve = useCallback(
    async (item: ApprovalItem) => {
      const res = await fetch('/api/capstone/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: item.student_id,
          capstone_id: item.capstone_id,
          current_stage: item.current_stage,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Approval failed')
        return
      }
      toast.success('Capstone stage approved')
      setItems((prev) => prev.filter((row) => row.progress_id !== item.progress_id))
    },
    []
  )

  return { items, loading, load, approve }
}
