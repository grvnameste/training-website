import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const boardId = searchParams.get('boardId')
    const label = searchParams.get('label')

    if (!boardId || !label) {
      return NextResponse.json(
        { error: 'boardId and label required' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?` +
        new URLSearchParams({
          filter: 'open',
          key: process.env.TRELLO_KEY!,
          token: process.env.TRELLO_TOKEN!,
        })
    )

    if (!res.ok) {
      throw new Error(await res.text())
    }

    const cards = await res.json()

    const studentCards = cards.filter((card: any) =>
      card.labels?.some((l: any) => l.name === label)
    )

    return NextResponse.json({
      count: studentCards.length,
    })
  } catch (err) {
    console.error('Trello count error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}
