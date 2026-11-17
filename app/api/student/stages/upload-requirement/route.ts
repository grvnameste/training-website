import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  requirementDocuments,
  studentActivity,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, notFound, toErrorResponse } from '@/lib/http/errors'
import { hasCourseEntitlement, getCourseById } from '@/lib/services/course-access-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { recordAudit } from '@/lib/services/audit-service'

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const bodySchema = z.object({
  capstone_id: z.string().uuid(),
  file_base64: z.string().min(1),
  file_name: z.string().min(1).max(255),
})

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) {
      throw badRequest('Invalid requirement upload', parsed.error.flatten())
    }

    const { capstone_id, file_base64, file_name } = parsed.data
    const capstone = await getCourseById(capstone_id)
    if (!capstone || !capstone.isCapstone) throw notFound('Capstone not found')
    if (!(await hasCourseEntitlement(authResult.context.profile.id, capstone))) {
      throw notFound('Capstone not found')
    }

    const safeFileName = file_name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')

    const matchedExt = Object.keys(ALLOWED_EXTENSIONS).find((ext) =>
      safeFileName.toLowerCase().endsWith(ext)
    )
    if (!matchedExt) {
      throw badRequest('Only PDF, DOC, and DOCX documents are allowed for Stage 1')
    }

    const buffer = Buffer.from(file_base64, 'base64')
    if (buffer.length > 10 * 1024 * 1024) {
      throw badRequest('File size exceeds the 10MB limit')
    }

    const studentId = authResult.context.profile.id
    const filePath = `requirements/${capstone_id}/${studentId}/${Date.now()}-${safeFileName}`
    const admin = getSupabaseAdmin()

    const { error: uploadError } = await admin.storage
      .from('capstone-requirements')
      .upload(filePath, buffer, {
        contentType: ALLOWED_EXTENSIONS[matchedExt],
        upsert: true,
      })

    if (uploadError) throw badRequest(uploadError.message)

    const { data: urlData } = admin.storage
      .from('capstone-requirements')
      .getPublicUrl(filePath)

    const fileUrl = urlData.publicUrl

    await db.transaction(async (tx) => {
      await tx
        .insert(requirementDocuments)
        .values({
          studentId,
          capstoneId: capstone_id,
          fileUrl,
          approved: false,
        })
        .onConflictDoUpdate({
          target: [requirementDocuments.studentId, requirementDocuments.capstoneId],
          set: { fileUrl, approved: false },
        })

      const [progress] = await tx
        .select()
        .from(studentCapstoneProgress)
        .where(
          and(
            eq(studentCapstoneProgress.studentId, studentId),
            eq(studentCapstoneProgress.capstoneId, capstone_id)
          )
        )
        .limit(1)

      if (progress) {
        await tx
          .update(studentCapstoneProgress)
          .set({ stage1Submitted: true })
          .where(eq(studentCapstoneProgress.id, progress.id))
      } else {
        await tx.insert(studentCapstoneProgress).values({
          studentId,
          capstoneId: capstone_id,
          currentStage: 1,
          stage1Submitted: true,
        })
      }

      await tx.insert(studentActivity).values({
        studentId,
        type: 'STAGE1_SUBMITTED',
      })
    })

    await recordAudit(authResult.context, {
      action: 'capstone.stage1.submitted',
      resourceType: 'capstone',
      resourceId: capstone_id,
      companyId: capstone.companyId,
    })

    return NextResponse.json({ success: true, file_url: fileUrl })
  } catch (error) {
    return toErrorResponse(error)
  }
}
