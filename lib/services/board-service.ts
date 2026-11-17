import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  boardTemplates,
  boards,
  cards,
  lists,
  profiles,
  templateCards,
  templateLists,
} from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { badRequest, notFound } from '@/lib/http/errors'
import {
  assertCourseManage,
  getCourseById,
  hasCourseEntitlement,
} from './course-access-service'

async function loadCapstoneAccess(ctx: AuthContext, capstoneId: string) {
  const capstone = await getCourseById(capstoneId)
  if (!capstone || !capstone.isCapstone) throw notFound('Capstone not found')
  const entitled = await hasCourseEntitlement(ctx.profile.id, capstone)
  if (!entitled) throw notFound('Capstone not found')
  return capstone
}

async function createBoardFromTemplate(capstoneId: string, studentId: string) {
  const [board] = await db
    .insert(boards)
    .values({ capstoneId, studentId })
    .returning()

  const [template] = await db
    .select()
    .from(boardTemplates)
    .where(eq(boardTemplates.capstoneId, capstoneId))
    .limit(1)

  if (!template) {
    for (const [index, title] of ['To Do', 'In Progress', 'Completed'].entries()) {
      await db.insert(lists).values({ boardId: board.id, title, position: index })
    }
    return board
  }

  const templateListsRows = await db
    .select()
    .from(templateLists)
    .where(eq(templateLists.templateId, template.id))
    .orderBy(asc(templateLists.position))

  for (const templateList of templateListsRows) {
    const [list] = await db
      .insert(lists)
      .values({
        boardId: board.id,
        title: templateList.title ?? 'Tasks',
        position: templateList.position ?? 0,
      })
      .returning()

    const templateCardsRows = await db
      .select()
      .from(templateCards)
      .where(eq(templateCards.listId, templateList.id))
      .orderBy(asc(templateCards.position))

    for (const templateCard of templateCardsRows) {
      await db.insert(cards).values({
        listId: list.id,
        title: templateCard.title ?? 'Task',
        position: templateCard.position ?? 0,
      })
    }
  }

  return board
}

export async function getStudentBoard(ctx: AuthContext, capstoneId: string) {
  const capstone = await loadCapstoneAccess(ctx, capstoneId)
  let [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.studentId, ctx.profile.id), eq(boards.capstoneId, capstone.id)))
    .limit(1)

  if (!board) {
    board = await createBoardFromTemplate(capstone.id, ctx.profile.id)
  }

  return loadBoard(board.id)
}

export async function getInstructorBoard(
  ctx: AuthContext,
  capstoneId: string,
  studentId: string
) {
  await assertCourseManage(ctx, capstoneId)
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.studentId, studentId), eq(boards.capstoneId, capstoneId)))
    .limit(1)

  if (!board) throw notFound('Board not found')

  const [data, capstone, student] = await Promise.all([
    loadBoard(board.id),
    getCourseById(capstoneId),
    db
      .select({ name: profiles.name, fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.id, studentId))
      .limit(1),
  ])

  return {
    ...data,
    capstoneTitle: capstone?.title ?? 'Capstone',
    studentName: student[0]?.name || student[0]?.fullName || 'Student',
  }
}

export async function loadBoard(boardId: string) {
  const [board] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1)
  if (!board) throw notFound('Board not found')

  const listRows = await db
    .select()
    .from(lists)
    .where(eq(lists.boardId, boardId))
    .orderBy(asc(lists.position))

  const cardRows =
    listRows.length > 0
      ? await db
          .select()
          .from(cards)
          .where(
            inArray(
              cards.listId,
              listRows.map((list) => list.id)
            )
          )
          .orderBy(asc(cards.position))
      : []

  return { board, lists: listRows, cards: cardRows }
}

export async function assertBoardAccess(ctx: AuthContext, boardId: string) {
  const [board] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1)
  if (!board) throw notFound('Board not found')

  if (board.studentId === ctx.profile.id) {
    await loadCapstoneAccess(ctx, board.capstoneId)
    return board
  }

  await assertCourseManage(ctx, board.capstoneId)
  return board
}

export async function addCard(
  ctx: AuthContext,
  boardId: string,
  input: { listId: string; title: string }
) {
  await assertBoardAccess(ctx, boardId)
  const [list] = await db
    .select({ id: lists.id })
    .from(lists)
    .where(and(eq(lists.id, input.listId), eq(lists.boardId, boardId)))
    .limit(1)
  if (!list) throw badRequest('List does not belong to this board')

  const existing = await db
    .select({ id: cards.id })
    .from(cards)
    .where(eq(cards.listId, input.listId))

  const [card] = await db
    .insert(cards)
    .values({
      listId: input.listId,
      title: input.title,
      position: existing.length,
      createdBy: ctx.profile.id,
    })
    .returning()

  return card
}

export async function updateCard(
  ctx: AuthContext,
  boardId: string,
  cardId: string,
  input: { listId?: string; position?: number; title?: string }
) {
  await assertBoardAccess(ctx, boardId)
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1)
  if (!card || !card.listId) throw notFound('Card not found')

  const [list] = await db
    .select({ boardId: lists.boardId })
    .from(lists)
    .where(eq(lists.id, card.listId))
    .limit(1)
  if (!list || list.boardId !== boardId) throw notFound('Card not found')

  const [updated] = await db
    .update(cards)
    .set({
      ...(input.listId !== undefined ? { listId: input.listId } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
    })
    .where(eq(cards.id, cardId))
    .returning()
  return updated
}

export async function deleteCard(ctx: AuthContext, boardId: string, cardId: string) {
  await assertBoardAccess(ctx, boardId)
  const [card] = await db
    .select({ id: cards.id, listId: cards.listId })
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1)
  if (!card || !card.listId) throw notFound('Card not found')

  const [list] = await db
    .select({ boardId: lists.boardId })
    .from(lists)
    .where(eq(lists.id, card.listId))
    .limit(1)
  if (!list || list.boardId !== boardId) throw notFound('Card not found')

  await db.delete(cards).where(eq(cards.id, cardId))
}

export async function reorderCards(
  ctx: AuthContext,
  boardId: string,
  items: { id: string; listId: string; position: number }[]
) {
  await assertBoardAccess(ctx, boardId)
  const board = await loadBoard(boardId)
  const validListIds = new Set(board.lists.map((list) => list.id))
  const validCardIds = new Set(board.cards.map((card) => card.id))

  for (const item of items) {
    if (!validListIds.has(item.listId) || !validCardIds.has(item.id)) {
      throw badRequest('Card order contains an invalid card or list')
    }
  }

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(cards)
        .set({ listId: item.listId, position: item.position })
        .where(eq(cards.id, item.id))
    }
  })
}
