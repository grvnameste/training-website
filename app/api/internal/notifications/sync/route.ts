import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cleanupExpiredSessions } from '@/lib/auth/session-store'
import { logger } from '@/lib/observability/logger'
import { syncDueNotificationsForAll } from '@/lib/services/notification-service'

function isAuthorized(req: Request, secret: string) {
  const header = req.headers.get('authorization') ?? ''
  const provided = header.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : req.headers.get('x-cron-secret') ?? ''
  if (!provided) return false
  const providedBuffer = Buffer.from(provided)
  const secretBuffer = Buffer.from(secret)
  if (providedBuffer.length !== secretBuffer.length) return false
  return timingSafeEqual(providedBuffer, secretBuffer)
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 503 }
    )
  }
  if (!isAuthorized(req, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [notifications, sessionsRemoved] = await Promise.all([
      syncDueNotificationsForAll(),
      cleanupExpiredSessions(),
    ])
    logger.info('cron_notification_sync_complete', { notifications, sessionsRemoved })
    return NextResponse.json({
      ok: true,
      notifications,
      sessionsRemoved,
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    logger.exception('cron_notification_sync_failed', error)
    return NextResponse.json({ error: 'Notification sync failed' }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
