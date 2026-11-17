import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { studentCapstoneProgress } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/server'
import { assertSameOrigin, parseJson } from '@/lib/http/request'
import { badRequest, conflict, notFound, toErrorResponse } from '@/lib/http/errors'
import { getCourseById, hasCourseEntitlement } from '@/lib/services/course-access-service'
import { getCertificateReadiness } from '@/lib/services/certificate-service'
import { recordAudit } from '@/lib/services/audit-service'

const bodySchema = z.object({ capstoneId: z.string().uuid() })

export async function POST(req: Request) {
  try {
    assertSameOrigin(req)
    const authResult = await requireAuth()
    if (!authResult.success) return authResult.response

    const parsed = bodySchema.safeParse(await parseJson(req))
    if (!parsed.success) throw badRequest('Invalid certificate request', parsed.error.flatten())

    const capstone = await getCourseById(parsed.data.capstoneId)
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
          eq(studentCapstoneProgress.capstoneId, capstone.id)
        )
      )
      .limit(1)

    if (!progress?.stage3Submitted) {
      throw conflict('STAGE3_REQUIRED', 'Submit Stage 3 before requesting a certificate')
    }
    if (progress.certificateIssued) {
      throw conflict('CERTIFICATE_ALREADY_ISSUED', 'Certificate already issued')
    }

    const readiness = await getCertificateReadiness(studentId, capstone.id)
    if (!readiness.certificateEnabled) {
      throw conflict('CERTIFICATE_DISABLED', 'Certificates are disabled for this course')
    }
    if (!readiness.requirementsMet) {
      throw conflict(
        'CERTIFICATE_REQUIREMENTS_INCOMPLETE',
        'Complete the approved assignments and required project milestones before requesting a certificate',
        {
          blockers: readiness.blockers,
          assignments: readiness.assignments,
          milestones: readiness.milestones,
        }
      )
    }

    await db
      .update(studentCapstoneProgress)
      .set({ certificateRequested: true })
      .where(eq(studentCapstoneProgress.id, progress.id))

    await recordAudit(authResult.context, {
      action: 'certificate.requested',
      resourceType: 'capstone',
      resourceId: capstone.id,
      companyId: capstone.companyId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
