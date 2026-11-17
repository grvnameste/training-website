import { and, asc, desc, eq, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chatMessages, chatRooms, courses, profiles } from '@/lib/db/schema'
import type { AuthContext } from '@/lib/auth/server'
import { notFound } from '@/lib/http/errors'

export async function listChatRooms(ctx: AuthContext) {
  const isStaff = ctx.role === 'teacher' || ctx.role === 'super_admin'
  const rows = await db
    .select({
      id: chatRooms.id,
      studentId: chatRooms.studentId,
      teacherId: chatRooms.teacherId,
      courseId: chatRooms.courseId,
      createdAt: chatRooms.createdAt,
      courseTitle: courses.title,
      studentName: profiles.name,
      studentImage: profiles.avatarUrl,
    })
    .from(chatRooms)
    .innerJoin(courses, eq(courses.id, chatRooms.courseId))
    .innerJoin(profiles, eq(profiles.id, chatRooms.studentId))
    .where(
      isStaff
        ? eq(chatRooms.teacherId, ctx.profile.id)
        : eq(chatRooms.studentId, ctx.profile.id)
    )
    .orderBy(desc(chatRooms.createdAt))

  return Promise.all(
    rows.map(async (room) => {
      const [lastMessage] = await db
        .select({
          content: chatMessages.content,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .where(eq(chatMessages.roomId, room.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1)

      const [unread] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.roomId, room.id),
            ne(chatMessages.senderId, ctx.profile.id),
            eq(chatMessages.isRead, false)
          )
        )

      return {
        id: room.id,
        student_id: room.studentId,
        teacher_id: room.teacherId,
        course_id: room.courseId,
        student_name: room.studentName ?? 'Student',
        student_image: room.studentImage,
        course_title: room.courseTitle,
        last_message: lastMessage?.content ?? null,
        last_message_at: lastMessage?.createdAt ?? room.createdAt,
        unread_count: unread?.count ?? 0,
      }
    })
  )
}

async function getParticipantRoom(ctx: AuthContext, roomId: string) {
  const [room] = await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.id, roomId))
    .limit(1)

  if (!room) throw notFound('Conversation not found')
  if (
    room.studentId !== ctx.profile.id &&
    room.teacherId !== ctx.profile.id &&
    ctx.role !== 'super_admin'
  ) {
    throw notFound('Conversation not found')
  }
  return room
}

export async function listRoomMessages(ctx: AuthContext, roomId: string) {
  await getParticipantRoom(ctx, roomId)

  await db
    .update(chatMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(chatMessages.roomId, roomId),
        ne(chatMessages.senderId, ctx.profile.id),
        eq(chatMessages.isRead, false)
      )
    )

  return db
    .select({
      id: chatMessages.id,
      room_id: chatMessages.roomId,
      sender_id: chatMessages.senderId,
      content: chatMessages.content,
      media_url: chatMessages.mediaUrl,
      media_type: chatMessages.mediaType,
      is_read: chatMessages.isRead,
      created_at: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.roomId, roomId))
    .orderBy(asc(chatMessages.createdAt))
}

export async function sendRoomMessage(
  ctx: AuthContext,
  roomId: string,
  input: { content?: string | null; mediaUrl?: string | null; mediaType?: string | null }
) {
  await getParticipantRoom(ctx, roomId)
  const [message] = await db
    .insert(chatMessages)
    .values({
      roomId,
      senderId: ctx.profile.id,
      content: input.content ?? null,
      mediaUrl: input.mediaUrl ?? null,
      mediaType: input.mediaType ?? null,
    })
    .returning()

  return {
    id: message.id,
    room_id: message.roomId,
    sender_id: message.senderId,
    content: message.content,
    media_url: message.mediaUrl,
    media_type: message.mediaType,
    is_read: message.isRead,
    created_at: message.createdAt,
  }
}

export async function markRoomRead(ctx: AuthContext, roomId: string) {
  await getParticipantRoom(ctx, roomId)
  await db
    .update(chatMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(chatMessages.roomId, roomId),
        ne(chatMessages.senderId, ctx.profile.id),
        eq(chatMessages.isRead, false)
      )
    )
}
