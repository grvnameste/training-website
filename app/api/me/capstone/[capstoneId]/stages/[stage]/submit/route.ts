import { and, eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  boards,
  cards,
  lists,
  stage2Submissions,
  studentActivity,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import { conflict, notFound, toErrorResponse } from '@/lib/http/errors'
import { getCourseById, hasCourseEntitlement } from '@/lib/services/course-access-service'
import { recordAudit } from '@/lib/services/audit-service'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ capstoneId: string; stage: string }> }
) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const { capstoneId, stage } = await params
    if (stage !== '2') {
      return NextResponse.json({ error: 'Use the upload endpoint for this stage' }, { status: 400 })
    }

    const capstone = await getCourseById(capstoneId)
    if (!capstone || !capstone.isCapstone) throw notFound('Capstone not found')
    const studentId = authResult.context.profile.id
    if (!(await hasCourseEntitlement(studentId, capstone))) {
      throw notFound('Capstone not found')
    }

    const [progress] = await db
      .select()
      .from(studentCapstoneProgress)
      .where(
        and(
          eq(studentCapstoneProgress.studentId, studentId),
          eq(studentCapstoneProgress.capstoneId, capstoneId)
        )
      )
      .limit(1)

    if (!progress) throw conflict('STAGE_OUT_OF_ORDER', 'Complete Stage 1 first')
    if (!progress.stage1Approved) {
      throw conflict('STAGE_OUT_OF_ORDER', 'Stage 1 must be approved before Stage 2')
    }

    const [board] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.studentId, studentId), eq(boards.capstoneId, capstoneId)))
      .limit(1)

    if (!board) throw conflict('BOARD_REQUIRED', 'Create your project board first')

    const listRows = await db.select().from(lists).where(eq(lists.boardId, board.id))
    const cardRows =
      listRows.length > 0
        ? await db
            .select()
            .from(cards)
            .where(
              inArray(
                cards.listId,
                listRows.map((row) => row.id)
              )
            )
        : []

    if (cardRows.length === 0) {
      throw conflict('TASKS_REQUIRED', 'Add tasks to your project board before submitting')
    }

    await db.transaction(async (tx) => {
      await tx.insert(stage2Submissions).values({
        studentId,
        capstoneId,
        boardId: board.id,
        boardData: { board, lists: listRows, cards: cardRows },
      })

      await tx
        .update(studentCapstoneProgress)
        .set({ stage2Submitted: true })
        .where(eq(studentCapstoneProgress.id, progress.id))

      await tx.insert(studentActivity).values({
        studentId,
        type: 'STAGE2_SUBMITTED',
      })
    })

    await recordAudit(authResult.context, {
      action: 'capstone.stage2.submitted',
      resourceType: 'capstone',
      resourceId: capstoneId,
      companyId: capstone.companyId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
