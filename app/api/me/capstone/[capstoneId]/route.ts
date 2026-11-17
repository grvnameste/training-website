import { and, desc, eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  boards,
  capstoneMeetings,
  cards,
  lists,
  requirementDocuments,
  stage3Submissions,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { notFound, toErrorResponse } from '@/lib/http/errors'
import { getCourseById, hasCourseEntitlement } from '@/lib/services/course-access-service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ capstoneId: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { capstoneId } = await params
    const capstone = await getCourseById(capstoneId)
    if (!capstone || !capstone.isCapstone) throw notFound('Capstone not found')

    const studentId = authResult.context.profile.id
    if (!(await hasCourseEntitlement(studentId, capstone))) {
      throw notFound('Capstone not found')
    }

    let [progress] = await db
      .select()
      .from(studentCapstoneProgress)
      .where(
        and(
          eq(studentCapstoneProgress.studentId, studentId),
          eq(studentCapstoneProgress.capstoneId, capstoneId)
        )
      )
      .limit(1)

    if (!progress) {
      ;[progress] = await db
        .insert(studentCapstoneProgress)
        .values({ studentId, capstoneId, currentStage: 1 })
        .returning()
    }

    const [requirement] = await db
      .select()
      .from(requirementDocuments)
      .where(
        and(
          eq(requirementDocuments.studentId, studentId),
          eq(requirementDocuments.capstoneId, capstoneId)
        )
      )
      .limit(1)

    const stage3Files = await db
      .select()
      .from(stage3Submissions)
      .where(
        and(
          eq(stage3Submissions.studentId, studentId),
          eq(stage3Submissions.capstoneId, capstoneId)
        )
      )
      .orderBy(desc(stage3Submissions.createdAt))

    const [meeting] = await db
      .select()
      .from(capstoneMeetings)
      .where(
        and(
          eq(capstoneMeetings.studentId, studentId),
          eq(capstoneMeetings.capstoneId, capstoneId)
        )
      )
      .limit(1)

    const [board] = await db
      .select({ id: boards.id })
      .from(boards)
      .where(and(eq(boards.studentId, studentId), eq(boards.capstoneId, capstoneId)))
      .limit(1)

    let cardCount = 0
    if (board) {
      const listRows = await db
        .select({ id: lists.id })
        .from(lists)
        .where(eq(lists.boardId, board.id))
      if (listRows.length > 0) {
        const cardRows = await db
          .select({ id: cards.id })
          .from(cards)
          .where(
            inArray(
              cards.listId,
              listRows.map((row) => row.id)
            )
          )
        cardCount = cardRows.length
      }
    }

    return NextResponse.json({
      capstone: { id: capstone.id, title: capstone.title },
      progress,
      requirement: requirement ?? null,
      stage3Files,
      meeting: meeting ?? null,
      board: board ? { id: board.id, cardCount } : null,
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
