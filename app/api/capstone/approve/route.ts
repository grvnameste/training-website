import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  boardTemplates,
  boards,
  cards,
  lists,
  requirementDocuments,
  stage3Submissions,
  studentCapstoneProgress,
  templateCards,
  templateLists,
} from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { assertSameOrigin, getClientIp, getUserAgent, parseJson } from '@/lib/http/request'
import {
  badRequest,
  conflict,
  notFound,
  toErrorResponse,
} from '@/lib/http/errors'
import {
  assertCourseManage,
  getCourseById,
  hasCourseEntitlement,
} from '@/lib/services/course-access-service'
import { recordAudit } from '@/lib/services/audit-service'

const bodySchema = z.object({
  student_id: z.string().uuid(),
  capstone_id: z.string().uuid(),
  current_stage: z.number().int().min(1).max(3),
})

async function ensureBoard(capstoneId: string, studentId: string) {
  const [existing] = await db
    .select({ id: boards.id })
    .from(boards)
    .where(and(eq(boards.capstoneId, capstoneId), eq(boards.studentId, studentId)))
    .limit(1)

  if (existing) return existing.id

  const [template] = await db
    .select({ id: boardTemplates.id, name: boardTemplates.name })
    .from(boardTemplates)
    .where(eq(boardTemplates.capstoneId, capstoneId))
    .limit(1)

  const [board] = await db
    .insert(boards)
    .values({ capstoneId, studentId })
    .returning({ id: boards.id })

  if (!template) return board.id

  const templateListsRows = await db
    .select()
    .from(templateLists)
    .where(eq(templateLists.templateId, template.id))

  for (const templateList of templateListsRows) {
    const [list] = await db
      .insert(lists)
      .values({
        boardId: board.id,
        title: templateList.title ?? 'Tasks',
        position: templateList.position ?? 0,
      })
      .returning({ id: lists.id })

    const templateCardsRows = await db
      .select()
      .from(templateCards)
      .where(eq(templateCards.listId, templateList.id))

    for (const templateCard of templateCardsRows) {
      await db.insert(cards).values({
        listId: list.id,
        title: templateCard.title ?? 'Task',
        position: templateCard.position ?? 0,
      })
    }
  }

  return board.id
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireRole(['teacher', 'super_admin'])
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid approval request', parsed.error.flatten())
    }

    const { student_id, capstone_id, current_stage } = parsed.data
    const capstone = await assertCourseManage(authResult.context, capstone_id)

    if (!(await hasCourseEntitlement(student_id, capstone))) {
      throw notFound('Student is not entitled to this capstone')
    }

    const [progress] = await db
      .select()
      .from(studentCapstoneProgress)
      .where(
        and(
          eq(studentCapstoneProgress.studentId, student_id),
          eq(studentCapstoneProgress.capstoneId, capstone_id)
        )
      )
      .limit(1)

    if (!progress) throw notFound('Capstone progress not found')
    if (progress.currentStage !== current_stage) {
      throw conflict(
        'STAGE_OUT_OF_ORDER',
        `Expected stage ${progress.currentStage}, received ${current_stage}`
      )
    }

    await db.transaction(async (tx) => {
      if (current_stage === 1) {
        await tx
          .update(requirementDocuments)
          .set({ approved: true })
          .where(
            and(
              eq(requirementDocuments.studentId, student_id),
              eq(requirementDocuments.capstoneId, capstone_id)
            )
          )

        await tx
          .update(studentCapstoneProgress)
          .set({
            currentStage: 2,
            stage1Submitted: true,
            stage1Approved: true,
            stage2Submitted: false,
            stage2Approved: false,
          })
          .where(eq(studentCapstoneProgress.id, progress.id))
      }

      if (current_stage === 2) {
        await tx
          .update(studentCapstoneProgress)
          .set({
            currentStage: 3,
            stage2Submitted: true,
            stage2Approved: true,
            stage3Submitted: false,
            stage3Approved: false,
          })
          .where(eq(studentCapstoneProgress.id, progress.id))
      }

      if (current_stage === 3) {
        await tx
          .update(stage3Submissions)
          .set({ approved: true })
          .where(
            and(
              eq(stage3Submissions.studentId, student_id),
              eq(stage3Submissions.capstoneId, capstone_id)
            )
          )

        await tx
          .update(studentCapstoneProgress)
          .set({
            currentStage: 3,
            stage3Submitted: true,
            stage3Approved: true,
            completed: true,
          })
          .where(eq(studentCapstoneProgress.id, progress.id))
      }
    })

    if (current_stage === 1) {
      await ensureBoard(capstone_id, student_id)
    }

    await recordAudit(authResult.context, {
      action: 'capstone.approved',
      resourceType: 'capstone',
      resourceId: capstone_id,
      companyId: capstone.companyId,
      metadata: { studentId: student_id, stage: current_stage },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
