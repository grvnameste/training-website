//app/api/trello/create-board/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { projectName } = await req.json()

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name required' },
        { status: 400 }
      )
    }

    /* ===============================
       1️⃣ CREATE BOARD
    =============================== */
    const boardRes = await fetch(
      `https://api.trello.com/1/boards/?` +
        new URLSearchParams({
          name: projectName,
          key: process.env.TRELLO_KEY!,
          token: process.env.TRELLO_TOKEN!,
          idOrganization: process.env.TRELLO_WORKSPACE_ID!,
          defaultLists: 'false',
        }),
      { method: 'POST' }
    )

    if (!boardRes.ok) {
      const err = await boardRes.text()
      throw new Error(err)
    }

    const board = await boardRes.json()

    /* ===============================
       2️⃣ CREATE SDLC LISTS
    =============================== */
    const lists = [
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ]

    for (const listName of lists) {
      await fetch(
        `https://api.trello.com/1/lists?` +
          new URLSearchParams({
            name: listName,
            idBoard: board.id,
            key: process.env.TRELLO_KEY!,
            token: process.env.TRELLO_TOKEN!,
          }),
        { method: 'POST' }
      )
    }

    /* ===============================
       3️⃣ RESPONSE
    =============================== */
    return NextResponse.json({
      boardId: board.id,
      boardUrl: board.url,
    })
  } catch (error: any) {
    console.error('Trello error:', error.message)

    return NextResponse.json(
      { error: 'Failed to create Trello board' },
      { status: 500 }
    )
  }
}
