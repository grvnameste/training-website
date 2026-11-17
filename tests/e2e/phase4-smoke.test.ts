import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'
import { after, before, describe, it } from 'node:test'

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim()
const skip = testDatabaseUrl
  ? false
  : 'TEST_DATABASE_URL is not set; run `npm run test:db:setup` against a dedicated database'

if (testDatabaseUrl) {
  const host = new URL(testDatabaseUrl).hostname
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])
  if (!localHosts.has(host) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
    throw new Error(
      `Refusing to run E2E smoke tests against ${host}. ` +
        'Set ALLOW_REMOTE_TEST_DB=1 only for an isolated CI database.'
    )
  }
}

const PORT = 3101
const BASE_URL = `http://127.0.0.1:${PORT}`
const TEST_PASSWORD = 'VerifyPass123!'
const SESSION_SECRET = 'phase4-e2e-session-secret-0123456789abcdef'
const CRON_SECRET = 'phase4-e2e-cron-secret'

describe('Phase 4 HTTP smoke tests', { skip }, () => {
  let server: ReturnType<typeof spawn> | null = null
  let serverOutput = ''
  let sql: ReturnType<typeof postgres> | null = null
  let capstoneId = ''

  const serverEnv = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    SESSION_SECRET,
    CRON_SECRET,
  }

  function runSeed(command: 'seed' | 'cleanup') {
    execFileSync(
      process.execPath,
      [join(process.cwd(), 'scripts', 'seed-ui-verification.mjs'), command],
      {
        env: {
          ...process.env,
          DATABASE_URL: testDatabaseUrl,
          VERIFY_UI_PASSWORD: TEST_PASSWORD,
        },
        encoding: 'utf8',
        stdio: 'pipe',
      }
    )
  }

  async function waitForServer() {
    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${BASE_URL}/login`)
        if (res.ok) return
      } catch {
        // not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    throw new Error(`Server did not become ready.\n${serverOutput}`)
  }

  async function login(identifier: string) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier, password: TEST_PASSWORD }),
    })
    assert.equal(res.status, 200, `login failed for ${identifier}`)
    const cookies = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? []
    const cookie = cookies[0] ?? res.headers.get('set-cookie')
    assert.ok(cookie, 'login did not return a session cookie')
    return cookie.split(';')[0]
  }

  function authHeaders(cookie: string) {
    return { cookie, 'content-type': 'application/json' }
  }

  before(async () => {
    if (!existsSync(join(process.cwd(), '.next', 'BUILD_ID'))) {
      throw new Error('Run `npm run build` before the E2E smoke tests')
    }

    runSeed('seed')
    sql = postgres(testDatabaseUrl!, {
      prepare: false,
      ssl: 'prefer',
      max: 1,
      onnotice: () => {},
    })
    const [capstone] = await sql`
      select id from courses where title = '[UI VERIFY] Capstone' limit 1
    `
    assert.ok(capstone, 'seeded capstone not found')
    capstoneId = capstone.id

    const nextBin = join(
      process.cwd(),
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'next.cmd' : 'next'
    )
    const child = spawn(nextBin, ['start', '-p', String(PORT)], {
      cwd: process.cwd(),
      env: serverEnv,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    server = child
    child.stdout?.on('data', (chunk) => {
      serverOutput += chunk.toString()
    })
    child.stderr?.on('data', (chunk) => {
      serverOutput += chunk.toString()
    })
    await waitForServer()
  })

  after(async () => {
    if (server) {
      if (process.platform === 'win32' && server.pid) {
        try {
          execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
            stdio: 'ignore',
          })
        } catch {
          // already stopped
        }
      } else {
        server.kill('SIGTERM')
      }
    }
    try {
      runSeed('cleanup')
    } catch {
      // best effort
    }
    await sql?.end()
  })

  it('runs the student and instructor happy paths over HTTP', async () => {
    const healthRes = await fetch(`${BASE_URL}/api/health`)
    assert.equal(healthRes.status, 200)
    const health = await healthRes.json()
    assert.equal(health.status, 'ok')
    assert.equal(health.migrations.applied, 16)

    const studentCookie = await login('verify_student')

    const studentAuditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { cookie: studentCookie },
    })
    assert.equal(studentAuditRes.status, 403)

    const dashboardRes = await fetch(`${BASE_URL}/api/me/dashboard`, {
      headers: { cookie: studentCookie },
    })
    assert.equal(dashboardRes.status, 200)
    const dashboard = await dashboardRes.json()
    assert.equal(dashboard.projectCounts.active, 1)
    assert.equal(dashboard.projectCounts.completed, 1)
    assert.equal(dashboard.projectCounts.dueSoonMilestones, 1)
    assert.equal(dashboard.projectCounts.overdueMilestones, 1)
    assert.ok(dashboard.nextActions.length >= 2)

    const notificationsRes = await fetch(`${BASE_URL}/api/me/notifications`, {
      headers: { cookie: studentCookie },
    })
    assert.equal(notificationsRes.status, 200)
    const notifications = await notificationsRes.json()
    assert.ok(notifications.unreadCount >= 4)
    const types = new Set(
      notifications.notifications.map((notification: { type: string }) => notification.type)
    )
    for (const type of [
      'assignment_due_soon',
      'assignment_overdue',
      'project_milestone_due_soon',
      'project_milestone_overdue',
    ]) {
      assert.ok(types.has(type), `missing notification type ${type}`)
    }

    const markReadRes = await fetch(`${BASE_URL}/api/me/notifications`, {
      method: 'PATCH',
      headers: { cookie: studentCookie },
    })
    assert.equal(markReadRes.status, 200)
    const afterRead = await (
      await fetch(`${BASE_URL}/api/me/notifications`, { headers: { cookie: studentCookie } })
    ).json()
    assert.equal(afterRead.unreadCount, 0)

    const requestRes = await fetch(`${BASE_URL}/api/me/certificates/request`, {
      method: 'POST',
      headers: authHeaders(studentCookie),
      body: JSON.stringify({ capstoneId }),
    })
    assert.equal(requestRes.status, 409)
    const requestBody = await requestRes.json()
    assert.equal(requestBody.code, 'CERTIFICATE_REQUIREMENTS_INCOMPLETE')
    assert.ok(Array.isArray(requestBody.details?.blockers))
    assert.ok(
      requestBody.details.blockers.some(
        (blocker: { type: string }) => blocker.type === 'assignment'
      )
    )
    assert.ok(
      requestBody.details.blockers.some(
        (blocker: { type: string }) => blocker.type === 'project_milestone'
      )
    )

    await sql!`
      update student_capstone_progress
      set certificate_requested = true
      where capstone_id = ${capstoneId}
    `

    const instructorCookie = await login('verify_admin')

    const certificatesRes = await fetch(`${BASE_URL}/api/instructor/certificates`, {
      headers: { cookie: instructorCookie },
    })
    assert.equal(certificatesRes.status, 200)
    const certificates = await certificatesRes.json()
    assert.equal(certificates.pending.length, 1)
    const pending = certificates.pending[0]
    assert.equal(pending.readiness.readyToIssue, false)
    assert.equal(pending.readiness.assignments.required, 2)
    assert.equal(pending.readiness.assignments.approved, 0)
    assert.equal(pending.readiness.milestones.required, 4)
    assert.equal(pending.readiness.milestones.approved, 1)
    assert.equal(pending.readiness.blockers.length, 5)

    const queueRes = await fetch(`${BASE_URL}/api/instructor/project-reviews`, {
      headers: { cookie: instructorCookie },
    })
    assert.equal(queueRes.status, 200)
    const queue = await queueRes.json()
    assert.equal(queue.submissions.length, 1)

    const reviewRes = await fetch(
      `${BASE_URL}/api/instructor/project-submissions/${queue.submissions[0].submissionId}/review`,
      {
        method: 'POST',
        headers: authHeaders(instructorCookie),
        body: JSON.stringify({ decision: 'approved', feedback: 'E2E approval' }),
      }
    )
    assert.equal(reviewRes.status, 200)
    const reviewedQueue = await (
      await fetch(`${BASE_URL}/api/instructor/project-reviews`, {
        headers: { cookie: instructorCookie },
      })
    ).json()
    assert.equal(reviewedQueue.submissions.length, 0)

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { cookie: instructorCookie },
    })
    assert.equal(auditRes.status, 200)
    const auditBody = await auditRes.json()
    assert.ok(auditBody.logs.length >= 1)
    assert.ok(
      auditBody.logs.some(
        (log: { action: string }) => log.action === 'project.milestone.reviewed'
      )
    )

    const cronUnauthorized = await fetch(`${BASE_URL}/api/internal/notifications/sync`)
    assert.equal(cronUnauthorized.status, 401)
    const cronRes = await fetch(`${BASE_URL}/api/internal/notifications/sync`, {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    })
    assert.equal(cronRes.status, 200)
    const cronBody = await cronRes.json()
    assert.equal(cronBody.ok, true)
    assert.ok(typeof cronBody.notifications.candidates === 'number')

    const rateLimitedIp = '203.0.113.99'
    let lastStatus = 0
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': rateLimitedIp,
        },
        body: JSON.stringify({ identifier: 'nobody', password: 'wrong-password' }),
      })
      lastStatus = res.status
    }
    assert.equal(lastStatus, 429)
  })
})
