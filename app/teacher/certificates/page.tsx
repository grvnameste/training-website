//app/teacher/certificates/page.tsx
'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

type PendingCertRow = {
  student_id: string
  capstone_id: string
  stage3_submitted: boolean
  certificate_requested: boolean
  completed: boolean
  certificate_issued: boolean

  student_name?: string
  capstone_title?: string
}

  
export default function TeacherCertificateApprovals() {
    const [pending, setPending] = useState<PendingCertRow[]>([])

    const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)

    const { data, error } = await supabase
    .from('student_capstone_progress')
    .select(`
      student_id,
      capstone_id,
      stage3_submitted,
      certificate_requested,
      completed,
      certificate_issued
    `)
    .eq('certificate_requested', true)
    .eq('certificate_issued', false)
    .eq('stage3_submitted', true)
      console.log('TEACHER DATA:', data)
  console.log('TEACHER ERROR:', error)
  
    

  if (!error && data) {
    /* ============ COLLECT IDS ============ */
    const studentIds = Array.from(new Set(data.map(d => d.student_id)))
    const capstoneIds = Array.from(new Set(data.map(d => d.capstone_id)))
  
    /* ============ FETCH STUDENTS ============ */
    let studentMap: Record<string, string> = {}
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, name')
        .in('id', studentIds)
  
      studentMap =
        students?.reduce<Record<string, string>>((acc, s) => {
          acc[s.id] = s.name
          return acc
        }, {}) ?? {}
    }
  
    /* ============ FETCH CAPSTONE TITLES ============ */
    let capstoneMap: Record<string, string> = {}
    if (capstoneIds.length > 0) {
      const { data: capstones } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', capstoneIds)
  
      capstoneMap =
        capstones?.reduce<Record<string, string>>((acc, c) => {
          acc[c.id] = c.title
          return acc
        }, {}) ?? {}
    }
  
    /* ============ FINAL MERGE ============ */
    const finalData: PendingCertRow[] = data.map(row => ({
      ...row,
      student_name: studentMap[row.student_id] ?? 'Unknown Student',
      capstone_title: capstoneMap[row.capstone_id] ?? 'Unknown Capstone',
    }))
  
    setPending(finalData)
  }
  



    setLoading(false)
  }

  const [issuing, setIssuing] = useState(false)


  const approve = async (studentId: string, capstoneId: string) => {
    const { error } = await supabase
      .from('student_capstone_progress')
      .update({
        completed: true
      })
      .eq('student_id', studentId)
      .eq('capstone_id', capstoneId)
  
    if (error) {
      alert(error.message)
      return false
    }
  
    return true
  }
  
  

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Certificate Approvals</h1>

      {pending.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No pending certificate requests
        </p>
      )}

      {pending.map(p => (
        <Card key={`${p.student_id}-${p.capstone_id}`}>
          <CardHeader>
          <CardTitle>
  {p.capstone_title}
</CardTitle>          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <div>
            

            <p className="text-sm text-gray-600">
  Student: <span className="font-medium">{p.student_name}</span>
</p>
            </div>

          

            <Button
  disabled={issuing}
  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
  onClick={async () => {
    setIssuing(true)

    const approved = await approve(p.student_id, p.capstone_id)
    if (!approved) {
      setIssuing(false)
      return
    }


    const res = await fetch('/api/certificate/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        studentId: p.student_id,
        courseId: p.capstone_id,
        studentName: p.student_name,
        courseName: p.capstone_title,
      }),
    })
    
    setIssuing(false)

    if (!res.ok) {
      alert('Failed to issue certificate')
      return
    }

    alert('Certificate approved & issued')
    load()
  }}
>
  🎓 Issue Certificate
</Button>

          </CardContent>
        </Card>
      ))}
    </div>
  )
}
