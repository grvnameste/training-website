import { hash } from 'bcryptjs'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
const password = process.env.VERIFY_UI_PASSWORD
const command = process.argv[2] ?? 'seed'
const PREFIX = '[UI VERIFY]'
const ADMIN_USERNAME = 'verify_admin'
const STUDENT_USERNAME = 'verify_student'

if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
if (command === 'seed' && (!password || password.length < 8)) {
  console.error('Set VERIFY_UI_PASSWORD to a value of at least 8 characters')
  process.exit(1)
}

const sql = postgres(url, {
  prepare: false,
  ssl: 'prefer',
  max: 1,
  onnotice: () => {},
})

async function cleanup() {
  const users = await sql`
    select id from users where username in (${ADMIN_USERNAME}, ${STUDENT_USERNAME})
  `
  const userIds = users.map((row) => row.id)
  const profiles = userIds.length
    ? await sql`select id from profiles where user_id in ${sql(userIds)}`
    : []
  const profileIds = profiles.map((row) => row.id)

  const courses = await sql`select id from courses where title like ${`${PREFIX}%`}`
  const courseIds = courses.map((row) => row.id)

  if (profileIds.length > 0) {
    await sql`delete from notifications where profile_id in ${sql(profileIds)}`
    await sql`delete from audit_logs where actor_profile_id in ${sql(profileIds)}`
  }
  if (courseIds.length > 0) {
    await sql`delete from project_templates where course_id in ${sql(courseIds)}`
    await sql`delete from assignments where course_id in ${sql(courseIds)}`
    await sql`delete from course_enrollments where course_id in ${sql(courseIds)}`
    await sql`delete from entitlements where course_id in ${sql(courseIds)}`
    await sql`delete from student_capstone_progress where capstone_id in ${sql(courseIds)}`
    await sql`delete from courses where id in ${sql(courseIds)}`
  }
  if (userIds.length > 0) {
    await sql`delete from company_memberships where user_id in ${sql(userIds)}`
    await sql`delete from user_sessions where user_id in ${sql(userIds)}`
    await sql`delete from profiles where user_id in ${sql(userIds)}`
    await sql`delete from users where id in ${sql(userIds)}`
  }

  return { userIds, profileIds, courseIds }
}

async function seed() {
  await cleanup()

  const [company] = await sql`select id from companies order by created_at limit 1`
  if (!company) throw new Error('No company found')

  const passwordHash = await hash(password, 12)

  const [adminUser] = await sql`
    insert into users (username, email, password_hash, role, status)
    values (${ADMIN_USERNAME}, ${`${ADMIN_USERNAME}@example.test`}, ${passwordHash}, 'super_admin', 'active')
    returning id
  `
  const [studentUser] = await sql`
    insert into users (username, email, password_hash, role, status)
    values (${STUDENT_USERNAME}, ${`${STUDENT_USERNAME}@example.test`}, ${passwordHash}, 'student', 'active')
    returning id
  `

  const [adminProfile] = await sql`
    insert into profiles (user_id, company_id, name, full_name, email, role)
    values (${adminUser.id}, ${company.id}, 'Verify Admin', 'Verify Admin', ${`${ADMIN_USERNAME}@example.test`}, 'super_admin')
    returning id
  `
  const [studentProfile] = await sql`
    insert into profiles (user_id, company_id, name, full_name, email, role)
    values (${studentUser.id}, ${company.id}, 'Verify Student', 'Verify Student', ${`${STUDENT_USERNAME}@example.test`}, 'student')
    returning id
  `

  const [capstone] = await sql`
    insert into courses (
      teacher_id, company_id, title, subtitle, description, status,
      is_capstone, certificate_enabled
    ) values (
      ${adminProfile.id}, ${company.id}, ${`${PREFIX} Capstone`},
      'UI verification course', 'Fixture data for UI verification.',
      'published', false, true
    )
    returning id
  `
  // Legacy trigger only runs for is_capstone=true inserts.
  await sql`update courses set is_capstone = true where id = ${capstone.id}`

  await sql`
    insert into course_enrollments (student_id, course_id, company_id, status, course_title)
    values (${studentProfile.id}, ${capstone.id}, ${company.id}, 'active', ${`${PREFIX} Capstone`})
  `
  await sql`
    insert into entitlements (student_id, course_id, company_id, source, status)
    values (${studentProfile.id}, ${capstone.id}, ${company.id}, 'test', 'active')
  `
  await sql`
    insert into student_capstone_progress (
      student_id, capstone_id, current_stage,
      stage1_submitted, stage1_approved, stage2_submitted, stage2_approved,
      stage3_submitted, stage3_approved, completed,
      certificate_requested, certificate_issued
    ) values (
      ${studentProfile.id}, ${capstone.id}, 3,
      true, true, true, true, true, true, true, false, false
    )
  `

  const [dueSoonAssignment] = await sql`
    insert into assignments (
      course_id, created_by, title, instructions, due_at,
      submission_types, max_attempts, is_required, status
    ) values (
      ${capstone.id}, ${adminProfile.id}, ${`${PREFIX} Due soon assignment`},
      'Fixture assignment due soon.', now() + interval '1 day',
      array['text'], 1, true, 'published'
    )
    returning id
  `
  const [overdueAssignment] = await sql`
    insert into assignments (
      course_id, created_by, title, instructions, due_at,
      submission_types, max_attempts, is_required, status
    ) values (
      ${capstone.id}, ${adminProfile.id}, ${`${PREFIX} Overdue assignment`},
      'Fixture assignment past due.', now() - interval '1 day',
      array['text'], 1, true, 'published'
    )
    returning id
  `

  const [template] = await sql`
    insert into project_templates (course_id, created_by, title, description, status)
    values (${capstone.id}, ${adminProfile.id}, ${`${PREFIX} Active project`}, 'UI verification project.', 'published')
    returning id
  `
  const [phase] = await sql`
    insert into project_phases (template_id, title, description, position)
    values (${template.id}, 'Build', 'Implementation phase', 0)
    returning id
  `
  const milestones = await sql`
    insert into project_milestones (
      phase_id, title, description, acceptance_criteria,
      estimated_hours, due_offset_days, is_required, position
    ) values
      (${phase.id}, ${`${PREFIX} Submitted milestone`}, 'Awaiting review', 'Works', 2, 1, true, 0),
      (${phase.id}, ${`${PREFIX} Overdue milestone`}, 'Past due', 'Works', 2, -1, true, 1),
      (${phase.id}, ${`${PREFIX} Due soon milestone`}, 'Due soon', 'Works', 2, 1, true, 2)
    returning id, title
  `
  const submittedMilestone = milestones.find((row) => row.title.includes('Submitted'))
  const overdueMilestone = milestones.find((row) => row.title.includes('Overdue'))
  const dueSoonMilestone = milestones.find((row) => row.title.includes('Due soon'))

  const [activeInstance] = await sql`
    insert into project_instances (template_id, course_id, student_id, status)
    values (${template.id}, ${capstone.id}, ${studentProfile.id}, 'active')
    returning id
  `
  const [submittedInstanceMilestone] = await sql`
    insert into project_instance_milestones (
      instance_id, milestone_id, status, due_at, submitted_at
    ) values (
      ${activeInstance.id}, ${submittedMilestone.id}, 'submitted',
      now() + interval '1 day', now()
    )
    returning id
  `
  await sql`
    insert into project_instance_milestones (instance_id, milestone_id, status, due_at)
    values
      (${activeInstance.id}, ${overdueMilestone.id}, 'available', now() - interval '1 day'),
      (${activeInstance.id}, ${dueSoonMilestone.id}, 'available', now() + interval '1 day')
  `
  await sql`
    insert into project_milestone_submissions (
      instance_milestone_id, student_id, attempt, content, submitted_at
    ) values (
      ${submittedInstanceMilestone.id}, ${studentProfile.id}, 1,
      'UI verification submission', now()
    )
  `

  const [completedTemplate] = await sql`
    insert into project_templates (course_id, created_by, title, description, status)
    values (${capstone.id}, ${adminProfile.id}, ${`${PREFIX} Completed project`}, 'Completed fixture project.', 'published')
    returning id
  `
  const [completedPhase] = await sql`
    insert into project_phases (template_id, title, description, position)
    values (${completedTemplate.id}, 'Deliver', 'Delivery phase', 0)
    returning id
  `
  const [completedMilestone] = await sql`
    insert into project_milestones (
      phase_id, title, description, estimated_hours, due_offset_days, is_required, position
    ) values (
      ${completedPhase.id}, ${`${PREFIX} Completed milestone`}, 'Done',
      1, 1, true, 0
    )
    returning id
  `
  const [completedInstance] = await sql`
    insert into project_instances (template_id, course_id, student_id, status, completed_at)
    values (${completedTemplate.id}, ${capstone.id}, ${studentProfile.id}, 'completed', now())
    returning id
  `
  await sql`
    insert into project_instance_milestones (instance_id, milestone_id, status, due_at, submitted_at, reviewed_at)
    values (
      ${completedInstance.id}, ${completedMilestone.id}, 'approved',
      now() + interval '1 day', now(), now()
    )
  `

  const [pendingReview] = await sql`
    select count(*)::int as count
    from project_instance_milestones im
    join project_instances i on i.id = im.instance_id
    where i.course_id = ${capstone.id} and im.status = 'submitted'
  `

  console.log(
    JSON.stringify(
      {
        admin: { username: ADMIN_USERNAME, password },
        student: { username: STUDENT_USERNAME, password },
        capstoneId: capstone.id,
        activeInstanceId: activeInstance.id,
        completedInstanceId: completedInstance.id,
        dueSoonAssignmentId: dueSoonAssignment.id,
        overdueAssignmentId: overdueAssignment.id,
        pendingReviews: pendingReview.count,
      },
      null,
      2
    )
  )
}

try {
  if (command === 'cleanup') {
    const result = await cleanup()
    console.log(`Removed ${result.userIds.length} users and ${result.courseIds.length} courses`)
  } else if (command === 'seed') {
    await seed()
  } else {
    console.error('Unknown command. Use seed or cleanup.')
    process.exitCode = 1
  }
} catch (error) {
  console.error('UI verification fixture failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
