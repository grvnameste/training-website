import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  stage3Submissions,
  studentActivity,
  studentCapstoneProgress,
} from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin } from '@/lib/http/request'
import {
  badRequest,
  conflict,
  notFound,
  toErrorResponse,
} from '@/lib/http/errors'
import { getCourseById, hasCourseEntitlement } from '@/lib/services/course-access-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { recordAudit } from '@/lib/services/audit-service'

const MAX_FILE_SIZE = 25 * 1024 * 1024

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const formData = await req.formData()
    const capstoneId = formData.get('capstone_id')
    const files = formData.getAll('files').filter((item): item is File => item instanceof File)

    if (typeof capstoneId !== 'string' || !capstoneId) {
      throw badRequest('Missing required parameter: capstone_id')
    }
    if (files.length === 0) {
      throw badRequest('Please attach at least one Stage 3 submission file')
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

    if (!progress) throw conflict('STAGE_OUT_OF_ORDER', 'Complete the earlier stages first')
    if (!progress.stage2Approved && progress.currentStage < 3) {
      throw conflict('STAGE_OUT_OF_ORDER', 'Stage 2 must be approved before Stage 3')
    }

    const admin = getSupabaseAdmin()
    const uploadedRecords: { file_name: string; file_url: string }[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw badRequest(`File "${file.name}" exceeds the 25MB limit`)
      }

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')

      const filePath = `stage3/${capstoneId}/${studentId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}-${safeFileName}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await admin.storage
        .from('capstone-requirements')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (uploadError) {
        throw badRequest(`Upload failed for ${file.name}: ${uploadError.message}`)
      }

      const { data: urlData } = admin.storage
        .from('capstone-requirements')
        .getPublicUrl(filePath)

      await db.insert(stage3Submissions).values({
        studentId,
        capstoneId,
        fileName: file.name,
        fileType: file.type || null,
        fileUrl: urlData.publicUrl,
        approved: false,
      })

      uploadedRecords.push({ file_name: file.name, file_url: urlData.publicUrl })
    }

    await db.transaction(async (tx) => {
      await tx
        .update(studentCapstoneProgress)
        .set({ stage3Submitted: true, submittedForReview: true })
        .where(eq(studentCapstoneProgress.id, progress.id))

      await tx.insert(studentActivity).values({
        studentId,
        type: 'STAGE3_SUBMITTED',
      })
    })

    await recordAudit(authResult.context, {
      action: 'capstone.stage3.submitted',
      resourceType: 'capstone',
      resourceId: capstoneId,
      companyId: capstone.companyId,
      metadata: { files: uploadedRecords.length },
    })

    return NextResponse.json({ success: true, files: uploadedRecords })
  } catch (error) {
    return toErrorResponse(error)
  }
}
