import postgres from 'postgres'
import { hash } from 'bcryptjs'

const url = process.env.DATABASE_URL
const password = process.env.SEED_PASSWORD

if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
if (!password || password.length < 8) {
  console.error('Set SEED_PASSWORD to a value of at least 8 characters')
  process.exit(1)
}

const sql = postgres(url, { prepare: false, ssl: 'prefer', max: 1 })

async function upsertUser({ username, name, role, membershipRole }) {
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

  const [profile] = await sql`
    insert into profiles (user_id, name, full_name, email, role)
    values (${user.id}, ${name}, ${name}, ${email}, ${role})
    on conflict (user_id) do update
      set name = excluded.name,
          full_name = excluded.full_name,
          email = excluded.email,
          role = excluded.role,
          updated_at = now()
    returning id
  `

  const [company] = await sql`select id from companies where slug = 'readnrevise' limit 1`
  if (company) {
    await sql`
      insert into company_memberships (company_id, user_id, role, status)
      values (${company.id}, ${user.id}, ${membershipRole}, 'active')
      on conflict (company_id, user_id, role) do update set status = 'active'
    `
  }

  return { userId: user.id, profileId: profile.id, email }
}

try {
  const student = await upsertUser({
    username: 'dev_student',
    name: 'Development Student',
    role: 'student',
    membershipRole: 'student',
  })
  const instructor = await upsertUser({
    username: 'dev_instructor',
    name: 'Development Instructor',
    role: 'teacher',
    membershipRole: 'instructor',
  })

  const [company] = await sql`select id from companies where slug = 'readnrevise' limit 1`
  if (!company) throw new Error('Platform company is missing')

  let [course] = await sql`
    select id from courses
    where title = 'Development Lab: Getting Started' and teacher_id = ${instructor.profileId}
    limit 1
  `

  if (!course) {
    ;[course] = await sql`
      insert into courses (
        teacher_id, company_id, title, subtitle, description, price,
        is_capstone, status, published_at, level, estimated_minutes,
        outcomes, prerequisites, tags, what_you_build
      ) values (
        ${instructor.profileId}, ${company.id},
        'Development Lab: Getting Started',
        'A small end-to-end course for local development',
        'Use this course to verify enrollment, lesson completion, notes, and resume behavior.',
        0, false, 'published', now(), 'beginner', 20,
        '["Complete a lesson","Write a private note","Resume from the dashboard"]'::jsonb,
        '["A browser"]'::jsonb,
        ARRAY['development','getting-started'],
        'A verified learning flow'
      )
      returning id
    `

    const [section] = await sql`
      insert into sections (course_id, title, order_index)
      values (${course.id}, 'Foundations', 0)
      returning id
    `

    await sql`
      insert into lessons (section_id, title, description, duration, order_index, completion_mode, estimated_minutes)
      values
        (${section.id}, 'Welcome to the lab', 'This lesson verifies the learning workspace.', '3:00', 0, 'manual', 3),
        (${section.id}, 'Your first completed lesson', 'Mark this lesson complete to update your dashboard.', '5:00', 1, 'manual', 5)
    `
  }

  console.log('Development accounts ready')
  console.log('student:', student.email, '(password from SEED_PASSWORD)')
  console.log('instructor:', instructor.email, '(password from SEED_PASSWORD)')
  console.log('free course:', course.id)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
