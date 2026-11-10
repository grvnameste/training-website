//app/api/trello/board-cards-count/route.ts

import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const boardId = searchParams.get('boardId')

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId required' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?` +
        new URLSearchParams({
          filter: 'open',
          fields: 'id',
          key: process.env.TRELLO_KEY!,
          token: process.env.TRELLO_TOKEN!,
        })
    )

    if (!res.ok) {
      throw new Error(await res.text())
    }

    const cards = await res.json()

    return NextResponse.json({
      count: cards.length,
    })
  } catch (err) {
    console.error('Trello count error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}
