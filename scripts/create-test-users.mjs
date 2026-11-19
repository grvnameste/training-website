// Creates one ready-to-use operator per portal (student, instructor, admin).
// Idempotent: re-running resets the password and role for these three accounts.

import postgres from 'postgres'
import { hash } from 'bcryptjs'

const url = process.env.DATABASE_URL
const password = process.env.TEST_PASSWORD || 'TestPass123!'

if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
if (password.length < 8) {
  console.error('TEST_PASSWORD must be at least 8 characters')
  process.exit(1)
}

const ACCOUNTS = [
  { username: 'test_student', name: 'Test Student', role: 'student', membershipRole: 'student' },
  { username: 'test_teacher', name: 'Test Teacher', role: 'teacher', membershipRole: 'instructor' },
  { username: 'test_admin', name: 'Test Admin', role: 'super_admin', membershipRole: 'org_admin' },
]

const sql = postgres(url, { prepare: false, ssl: 'prefer', max: 1 })

async function upsertAccount({ username, name, role, membershipRole }) {
  const email = `${username}@example.com`
  const passwordHash = await hash(password, 12)

  const [user] = await sql`
    insert into users (username, email, password_hash, role, status)
    values (${username}, ${email}, ${passwordHash}, ${role}, 'active')
    on conflict (username) do update
      set email = excluded.email,
          password_hash = excluded.password_hash,
          role = excluded.role,
          status = 'active',
          updated_at = now()
    returning id
  `

  await sql`
    insert into profiles (user_id, name, full_name, email, role)
    values (${user.id}, ${name}, ${name}, ${email}, ${role})
    on conflict (user_id) do update
      set name = excluded.name,
          full_name = excluded.full_name,
          email = excluded.email,
          role = excluded.role,
          updated_at = now()
  `

  const [company] = await sql`select id from companies where slug = 'readnrevise' limit 1`
  if (company) {
    await sql`
      insert into company_memberships (company_id, user_id, role, status)
      values (${company.id}, ${user.id}, ${membershipRole}, 'active')
      on conflict (company_id, user_id, role) do update set status = 'active'
    `
  }

  return { email, role, membershipRole }
}

try {
  const rows = []
  for (const account of ACCOUNTS) {
    const { email, role, membershipRole } = await upsertAccount(account)
    rows.push({ username: account.username, email, password, role, membershipRole })
  }

  console.log('Test operators ready:\n')
  for (const row of rows) {
    console.log(
      `  ${row.role.padEnd(11)} ${row.username.padEnd(13)} ${row.email.padEnd(26)} ${row.password}`
    )
  }
  console.log('\nSign in with username or email at /login')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
