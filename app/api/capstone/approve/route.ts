// app/api/capstone/approve/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const item = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { student_id, capstone_id, current_stage } = item

    /* ================= STAGE 1 APPROVAL ================= */
    if (current_stage === 1) {
      // ✅ Approve requirement document
      const { error: reqErr } = await supabase
        .from('requirement_documents')
        .update({ approved: true })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (reqErr) throw reqErr

      // ✅ Move student to Stage 2 + RESET review flag
      const { error: progErr } = await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 2,
          stage1_submitted: false,
          submitted_for_review: false, // ⭐ IMPORTANT
        })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (progErr) throw progErr

      return NextResponse.json({ success: true })
    }

    /* ================= STAGE 2 APPROVAL ================= */
    if (current_stage === 2) {
      const { error } = await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 3,
          stage2_submitted: false,
          submitted_for_review: false, // ⭐ IMPORTANT
        })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    /* ================= STAGE 3 APPROVAL ================= */
    if (current_stage === 3) {
      // ✅ Approve all Stage 3 files
      const { error: filesErr } = await supabase
        .from('stage3_submissions')
        .update({ approved: true })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (filesErr) throw filesErr

      // ✅ Mark capstone completed + RESET review flag
      const { error: progErr } = await supabase
        .from('student_capstone_progress')
        .update({
          stage3_submitted: false,
          completed: true,
          submitted_for_review: false, // ⭐ IMPORTANT
        })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (progErr) throw progErr

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid stage' },
      { status: 400 }
    )
  } catch (err) {
    console.error('APPROVAL ERROR:', err)
    return NextResponse.json(
      { error: 'Approval failed' },
      { status: 500 }
    )
  }
}
