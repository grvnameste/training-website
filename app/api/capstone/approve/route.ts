import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const item = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* ================= STAGE 1 ================= */
    if (item.current_stage === 1) {
      const { data: progress } = await supabase
        .from('student_capstone_progress')
        .select('submitted_for_review')
        .eq('id', item.progress_id)
        .single()

      if (!progress?.submitted_for_review) {
        return NextResponse.json(
          { error: 'Not submitted for review' },
          { status: 400 }
        )
      }

      const { data: userData } =
        await supabase.auth.admin.getUserById(item.student_id)

      const studentEmail = userData?.user?.email
      if (!studentEmail) throw new Error('Student email not found')

      const trelloRes = await fetch(
        new URL('/api/trello/create-board', req.url),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: item.title,
            studentEmail,
          }),
        }
      )

      const { boardId, boardUrl } = await trelloRes.json()

      await supabase
        .from('requirement_documents')
        .update({ approved: true })
        .eq('student_id', item.student_id)
        .eq('capstone_id', item.capstone_id)

      await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 2,
          trello_board_id: boardId,
          trello_board_url: boardUrl,
          submitted_for_review: false,
        })
        .eq('id', item.progress_id)
    }

    /* ================= STAGE 2 ================= */
    if (item.current_stage === 2) {
      await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 3,
          submitted_for_review: false,
        })
        .eq('id', item.progress_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Approval failed' },
      { status: 500 }
    )
  }
}
