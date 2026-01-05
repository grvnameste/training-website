import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { requirementId, capstoneId, studentId, projectName } =
      await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* 1️⃣ ENSURE PROGRESS EXISTS */
    const { data: progress, error: progressError } =
      await supabase
        .from('student_capstone_progress')
        .upsert(
          {
            student_id: studentId,
            capstone_id: capstoneId,
            current_stage: 2,
            is_approved: true,
          },
          { onConflict: 'student_id,capstone_id' }
        )
        .select()
        .single()

    if (progressError) throw progressError

    /* 2️⃣ CREATE TRELLO BOARD (✅ FIXED URL) */
    const trelloUrl = new URL(
      '/api/trello/create-board',
      req.url
    )

    const trelloRes = await fetch(trelloUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName }),
    })

    if (!trelloRes.ok) {
      const errText = await trelloRes.text()
      throw new Error('Trello creation failed: ' + errText)
    }

    const { boardId, boardUrl } = await trelloRes.json()

    /* 3️⃣ APPROVE REQUIREMENT */
    await supabase
      .from('requirement_documents')
      .update({ approved: true })
      .eq('id', requirementId)

    /* 4️⃣ UPDATE PROGRESS */
    await supabase
      .from('student_capstone_progress')
      .update({
        trello_board_id: boardId,
        trello_board_url: boardUrl,
      })
      .eq('id', progress.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('APPROVAL ERROR:', err)
    return NextResponse.json(
      { error: 'Approval failed' },
      { status: 500 }
    )
  }
}
