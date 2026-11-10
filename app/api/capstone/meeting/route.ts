//app/api/capstone/meeting/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const capstoneId = searchParams.get('capstoneId')
    const studentId = searchParams.get('studentId')


    if (!capstoneId || !studentId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 🔍 SUPER LENIENT FETCH: Get any meetings for this student
    const { data: meetings, error } = await supabase
      .from('capstone_meetings')
      .select('*')
      .eq('student_id', studentId)


    // Find the best match
    let match = meetings?.find(m => m.capstone_id === capstoneId)

    // Fallback: If not exact capstoneId, maybe it's a child/parent relation
    if (!match && meetings && meetings.length > 0) {
      // For now, if student has ONLY ONE meeting, just show it to them to avoid confusion
      if (meetings.length === 1) {
        match = meetings[0]
      }
    }


    if (error) throw error

    return NextResponse.json(match)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, capstoneId, meetingLink, meetingDate, meetingTime, notes } = body

    if (!studentId || !capstoneId || !meetingLink || !meetingDate || !meetingTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('capstone_meetings')
      .upsert({
        student_id: studentId,
        capstone_id: capstoneId,
        meeting_link: meetingLink,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        notes: notes || ''
      }, { onConflict: 'student_id,capstone_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
