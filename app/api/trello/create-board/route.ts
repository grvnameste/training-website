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
    return NextResponse.json(
      { error: "Student ID missing" },
      { status: 400 }
    )
  }

  // UPSERT (atomic)
  const { data: board, error } = await supabase
    .from("boards")
    .upsert(
      {
        capstone_id: capstoneId,
        student_id: studentId
      },
      {
        onConflict: "capstone_id,student_id"
      }
    )
    .select()
    .single()

  if (error) throw error

  // check lists
  const { data: lists } = await supabase
    .from("lists")
    .select("id")
    .eq("board_id", board.id)

  if (!lists || lists.length === 0) {

    await supabase.from("lists").insert([
      { title: "Todo", board_id: board.id, position: 1 },
      { title: "Doing", board_id: board.id, position: 2 },
      { title: "Done", board_id: board.id, position: 3 }
    ])

  }

  return NextResponse.json(board)
}