import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { student_id, capstone_id } = await req.json()

    if (!student_id || !capstone_id) {
      return NextResponse.json(
        { error: 'student_id and capstone_id are required' },
        { status: 400 }
      )
    }

    const {
      NEXT_PUBLIC_TRELLO_BOARD_ID,
      TRELLO_KEY,
      TRELLO_TOKEN,
    } = process.env

    if (!NEXT_PUBLIC_TRELLO_BOARD_ID || !TRELLO_KEY || !TRELLO_TOKEN) {
      console.error('Missing Trello env vars')
      return NextResponse.json(
        { error: 'Trello env variables missing' },
        { status: 500 }
      )
    }

    /* ================= GET STUDENT EMAIL ================= */
    const { data, error } =
      await supabase.auth.admin.getUserById(student_id)

    if (error || !data?.user?.email) {
      console.error('Supabase user error:', error)
      return NextResponse.json(
        { error: 'Student email not found' },
        { status: 400 }
      )
    }

    const studentEmail = data.user.email

    /* ================= INVITE TO TRELLO BOARD ================= */
    const trelloInviteUrl =
      `https://api.trello.com/1/boards/${NEXT_PUBLIC_TRELLO_BOARD_ID}/members` +
      `?email=${encodeURIComponent(studentEmail)}` +
      `&type=normal` +
      `&key=${TRELLO_KEY}` +
      `&token=${TRELLO_TOKEN}`

    const trelloRes = await fetch(trelloInviteUrl, { method: 'PUT' })
    const trelloText = await trelloRes.text()

    console.log('Trello status:', trelloRes.status)
    console.log('Trello response:', trelloText)

    // ❗ already invited ko success treat karo
    if (!trelloRes.ok && !trelloText.includes('already')) {
      return NextResponse.json(
        { error: 'Trello invite failed', trello: trelloText },
        { status: 500 }
      )
    }

    /* ================= UPDATE STUDENT PROGRESS ================= */
    await supabase
      .from('student_capstone_progress')
      .update({
        trello_board_id: NEXT_PUBLIC_TRELLO_BOARD_ID,
        trello_board_url: `https://trello.com/b/${NEXT_PUBLIC_TRELLO_BOARD_ID}`,
        submitted_for_review: true,
      })
      .eq('student_id', student_id)
      .eq('capstone_id', capstone_id)

    /* ================= MARK REQUEST APPROVED ================= */
    await supabase
      .from('trello_access_requests')
      .update({ status: 'approved' })
      .eq('student_id', student_id)
      .eq('capstone_id', capstone_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invite API crash:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
