//hooks/useCapstoneApprovals.ts
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { useUser } from '@clerk/nextjs'
export interface ApprovalItem {
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
  meeting?: any
}

export function useCapstoneApprovals() {
  const { user } = useUser()

  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)

      if (!user) {
        setItems([])
        return
      }
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('clerk_id', user.id)
  .single()
  console.log("PROFILE:", profile)

if (!profile) {
  setItems([])
  return
}

// ✅ USE profile.id
const { data: courses } = await supabase
  .from('courses')
  .select('id')
  .eq('teacher_id', profile.id)

  console.log("COURSES:", courses)
      // Teacher Courses
      

      const courseIds = courses?.map(c => c.id) ?? []
      if (!courseIds.length) {
        setItems([])
        return
      }

      // Capstones
      const { data: capstonesData } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_capstone', true)
      .eq('teacher_id', profile.id)
      .eq('is_capstone', true)
      const capstones = capstonesData ?? []
      console.log("CAPSTONES:", capstones)
      if (!capstones.length) {
        setItems([])
        return
      }

      const capstoneIds = capstones.map(c => c.id)

      // Fetch all required stages data in parallel
      const [stage1Res, progressRes, stage3FilesRes] = await Promise.all([
        supabase.from('requirement_documents').select('*'),
        supabase.from('student_capstone_progress').select('*').in('capstone_id', capstoneIds),
        supabase.from('stage3_submissions').select('*').in('capstone_id', capstoneIds)
      ])

      const stage1 = (stage1Res.data ?? []).filter(r =>
        capstoneIds.includes(r.capstone_id)
      )
            const progress = progressRes.data ?? []
      console.log("STAGE1 DOCS:", stage1)
console.log("PROGRESS:", progress)
      const stage3Files = stage3FilesRes.data ?? []

      const merged: ApprovalItem[] = []

      // Merge Stage 1
      stage1.forEach(r => {
        const cap = capstones.find(c => c.id === r.capstone_id)
        const prog = progress.find(
          p => p.student_id === r.student_id && p.capstone_id === r.capstone_id
        )
      
        console.log("---- STAGE1 CHECK ----")
        console.log("DOC:", r)
        console.log("CAP:", cap)
        console.log("PROG:", prog)
      
        console.log("CONDITIONS:", {
          hasCap: !!cap,
          hasProg: !!prog,
          submitted: prog?.stage1_submitted,
          approved: prog?.stage1_approved
        })
      
        if (!cap || !prog || !prog.stage1_submitted || prog.stage1_approved) {
          console.log("❌ SKIPPED")
          return
        }
      
        console.log("✅ ADDED TO UI")
      
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
      })
      // Merge Stage 2 & 3
      progress.forEach(p => {
        const cap = capstones.find(c => c.id === p.capstone_id)
        if (!cap) return

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
          const files = stage3Files.filter(f => f.student_id === p.student_id && f.capstone_id === p.capstone_id)
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
      })

      const studentIds = Array.from(new Set(merged.map(m => m.student_id)))
      
      if (studentIds.length > 0) {
        // Fetch profiles and meetings in parallel
        const [profilesRes, meetingsRes] = await Promise.all([
          supabase.from('student_profiles').select('id, name').in('id', studentIds),
          supabase.from('capstone_meetings').select('*').in('student_id', studentIds).in('capstone_id', capstoneIds)
        ])


        const studentMap = (profilesRes.data ?? []).reduce((acc: any, p) => ({ ...acc, [p.id]: p.name }), {})
        const meetingMap = (meetingsRes.data ?? []).reduce((acc: any, m) => ({ ...acc, [`${m.student_id}-${m.capstone_id}`]: m }), {})

        const finalItems = merged.map(item => ({
          ...item,
          student_name: studentMap[item.student_id] ?? 'Unknown Student',
          meeting: meetingMap[`${item.student_id}-${item.capstone_id}`],
        }))
        setItems(finalItems)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      load()
    }
  }, [user])

  const approve = async (item: ApprovalItem) => {
    const res = await fetch('/api/capstone/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    if (!res.ok) {
      alert('Approval failed ❌')
      return false
    }

    alert(`Stage ${item.current_stage} approved ✅`)
    await load()
    return true
  }

  return { items, loading, load, approve }
}
