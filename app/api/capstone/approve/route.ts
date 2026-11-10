//app/api/capstone/approve/route.ts
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

      // ✅ Move student to Stage 2
      const { error: progErr } = await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 2,
          stage1_submitted: true,
          stage1_approved: true,
          stage2_submitted: false,
          stage2_approved: false,
        })
        
        
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (progErr) throw progErr
      // ✅ Create board for this capstone if not exists
// 🔥 CREATE BOARD FROM TEMPLATE (FINAL FIX)

// check if already exists (student specific)
const { data: existingBoard } = await supabase
  .from('boards')
  .select('id')
  .eq('capstone_id', capstone_id)
  .eq('student_id', student_id)
  .maybeSingle()

if (!existingBoard) {
  // get template
  const { data: template } = await supabase
    .from('board_templates')
    .select('id')
    .eq('capstone_id', capstone_id)
    .single()

  if (template) {
    // create board
    const { data: board } = await supabase
      .from('boards')
      .insert({
        capstone_id,
        student_id
      })
      .select()
      .single()

    // get template lists
    const { data: lists } = await supabase
      .from('template_lists')
      .select('*')
      .eq('template_id', template.id)
      .order('position')

    for (const l of lists || []) {
      const { data: newList } = await supabase
        .from('lists')
        .insert({
          board_id: board.id,
          title: l.title,
          position: l.position
        })
        .select()
        .single()

      const { data: cards } = await supabase
        .from('template_cards')
        .select('*')
        .eq('list_id', l.id)
        .order('position')

      for (const c of cards || []) {
        await supabase.from('cards').insert({
          list_id: newList.id,
          title: c.title,
          position: c.position
        })
      }
    }
  }
}

      return NextResponse.json({ success: true })
    }

    /* ================= STAGE 2 APPROVAL ================= */
    if (current_stage === 2) {
      const { error } = await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 3,
          stage2_submitted: true,
          stage2_approved: true,
          stage3_submitted: false,
          stage3_approved: false,
        })
        
        
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    /* ================= STAGE 3 APPROVAL ================= */
    if (current_stage === 3) {
      await supabase
        .from('stage3_submissions')
        .update({ approved: true })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)
    
      const { error } = await supabase
        .from('student_capstone_progress')
        .update({
          current_stage: 3,
          stage3_submitted: true,
          stage3_approved: true,
          completed: true,
        })
        .eq('student_id', student_id)
        .eq('capstone_id', capstone_id)
    
      if (error) throw error
    
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

