import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(url, { prepare: false, ssl: 'prefer', max: 1 })

const requiredTables = [
  'companies',
  'company_memberships',
  'users',
  'user_sessions',
  'profiles',
  'courses',
  'sections',
  'lessons',
  'course_enrollments',
  'entitlements',
  'lesson_completions',
  'lesson_playback',
  'student_capstone_progress',
  'capstone_meetings',
  'certificates',
  'audit_logs',
  'lesson_blocks',
  'lesson_resources',
  'lesson_transcripts',
  'lesson_notes',
  'student_preferences',
  'assignments',
  'rubrics',
  'rubric_criteria',
  'assignment_submissions',
  'submission_files',
  'assignment_reviews',
  'review_scores',
  'project_templates',
  'project_phases',
  'project_milestones',
  'project_instances',
  'project_instance_milestones',
  'project_milestone_submissions',
  'project_milestone_files',
  'notifications',
  'schema_migrations',
]

const requiredColumns = {
  courses: ['status', 'published_at', 'level', 'estimated_minutes', 'outcomes', 'tags'],
  lessons: ['summary', 'objectives', 'estimated_minutes', 'completion_mode', 'is_preview'],
  users: ['status'],
  course_enrollments: ['company_id', 'status'],
}

try {
  const tableRows = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public'
  `
  const tables = new Set(tableRows.map((row) => row.table_name))
  const missingTables = requiredTables.filter((table) => !tables.has(table))

  const missingColumns = []
  for (const [table, columns] of Object.entries(requiredColumns)) {
    const rows = await sql`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = ${table}
    `
    const present = new Set(rows.map((row) => row.column_name))
    for (const column of columns) {
      if (!present.has(column)) missingColumns.push(`${table}.${column}`)
    }
  }

  const rlsRows = await sql`
    select relname, relrowsecurity
    from pg_class
    where relnamespace = 'public'::regnamespace
      and relname in ('lesson_blocks','lesson_resources','lesson_transcripts','lesson_notes','student_preferences','assignments','project_templates','notifications')
  `
  const rlsMissing = rlsRows.filter((row) => !row.relrowsecurity).map((row) => row.relname)

  const [entitlementIndex] = await sql`
    select indexname from pg_indexes
    where schemaname = 'public' and indexname = 'entitlements_active_student_course_key'
  `

  const migrationFiles = readdirSync(join(process.cwd(), 'supabase', 'migrations'))
    .filter((file) => file.endsWith('.sql'))
    .sort()
  const ledgerRows = tables.has('schema_migrations')
    ? await sql`select filename from schema_migrations`
    : []
  const ledgerFiles = new Set(ledgerRows.map((row) => row.filename))
  const unledgered = migrationFiles.filter((file) => !ledgerFiles.has(file))

  const problems = []
  if (missingTables.length) problems.push(`Missing tables: ${missingTables.join(', ')}`)
  if (missingColumns.length) problems.push(`Missing columns: ${missingColumns.join(', ')}`)
  if (rlsMissing.length) problems.push(`RLS not enabled: ${rlsMissing.join(', ')}`)
  if (!entitlementIndex) problems.push('Missing active entitlement unique index')
  if (unledgered.length) problems.push(`Migrations not recorded in schema_migrations: ${unledgered.join(', ')}`)

  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exitCode = 1
  } else {
    console.log('Schema verification passed')
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
