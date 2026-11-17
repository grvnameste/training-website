import postgres from 'postgres'
import { hash } from 'bcryptjs'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase()
const email = (process.env.ADMIN_EMAIL || `${username}@example.com`).trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME || 'Administrator'

if (!password || password.length < 8) {
  console.error('Set ADMIN_PASSWORD to a value of at least 8 characters')
  process.exit(1)
}

const sql = postgres(url, { prepare: false, ssl: 'prefer', max: 1 })

try {
  const passwordHash = await hash(password, 12)

  const [user] = await sql`
    insert into users (username, email, password_hash, role)
    values (${username}, ${email}, ${passwordHash}, 'super_admin')
    on conflict (username) do update
      set email = excluded.email,
          password_hash = excluded.password_hash,
          role = 'super_admin',
          updated_at = now()
    returning id
  `

  await sql`
    insert into profiles (user_id, name, full_name, email, role)
    values (${user.id}, ${name}, ${name}, ${email}, 'super_admin')
    on conflict (user_id) do nothing
  `

  console.log(`Admin account ready: ${username}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
