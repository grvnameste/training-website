//app/api/trello/create-board/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { capstoneId, studentId } = await req.json()

  if (!studentId) {
    return NextResponse.json({ error: "Student ID missing" }, { status: 400 })
  }

  // 1️⃣ CREATE / GET BOARD
  const { data: board, error } = await supabase
  .from("boards")
  .upsert(
    { capstone_id: capstoneId, student_id: studentId },
    { onConflict: "capstone_id,student_id" }
  )
  .select()
  .maybeSingle()

if (error || !board) {
  return NextResponse.json({ error: "Board creation failed" }, { status: 500 })
}

  if (!board) {
    return NextResponse.json({ error: "Board creation failed" }, { status: 500 })
  }

 // 2️⃣ CHECK IF ALREADY INITIALIZED
const { data: existingLists } = await supabase
.from("lists")
.select("id")
.eq("board_id", board.id)

// ❗ ONLY CREATE IF EMPTY
if (existingLists && existingLists.length > 0) {
return NextResponse.json(board)
}

  // 3️⃣ GET TEMPLATE
  const { data: template } = await supabase
    .from("board_templates")
    .select("*")
    .eq("capstone_id", capstoneId)
    .single()

  if (!template) return NextResponse.json(board)

  // 4️⃣ TEMPLATE LISTS
  const { data: templateLists } = await supabase
    .from("template_lists")
    .select("*")
    .eq("template_id", template.id)
    .order("position")

  const listMap: Record<string, string> = {}

  for (const l of templateLists || []) {
    const { data: newList } = await supabase
      .from("lists")
      .insert({
        board_id: board.id,
        title: l.title,
        position: l.position
      })
      .select()
      .single()

    listMap[l.id] = newList.id
  }

  // 5️⃣ TEMPLATE CARDS
  const { data: templateCards } = await supabase
    .from("template_cards")
    .select("*")
    .in("list_id", (templateLists || []).map(l => l.id))

  for (const c of templateCards || []) {
    await supabase.from("cards").insert({
      list_id: listMap[c.list_id],
      title: c.title,
      position: c.position || 0
    })
  }

  return NextResponse.json(board)
}