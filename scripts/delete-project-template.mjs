import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const args = process.argv.slice(2)
const idArg = args.find((arg) => arg.startsWith('--id='))?.slice('--id='.length)
const titleArg = args
  .find((arg) => arg.startsWith('--title='))
  ?.slice('--title='.length)
const apply = args.includes('--apply')

if (!idArg && !titleArg) {
  console.error('Usage: node scripts/delete-project-template.mjs --title="<title>" [--apply]')
  console.error('   or: node scripts/delete-project-template.mjs --id=<template-id> [--apply]')
  process.exit(1)
}

const sql = postgres(url, {
  prepare: false,
  ssl: 'prefer',
  max: 1,
  onnotice: () => {},
})

async function countsFor(templateId) {
  const [phases] = await sql`
    select count(*)::int as count from project_phases where template_id = ${templateId}
  `
  const [milestones] = await sql`
    select count(*)::int as count
    from project_milestones m
    join project_phases p on p.id = m.phase_id
    where p.template_id = ${templateId}
  `
  const [instances] = await sql`
    select count(*)::int as count from project_instances where template_id = ${templateId}
  `
  const [instanceMilestones] = await sql`
    select count(*)::int as count
    from project_instance_milestones im
    join project_instances i on i.id = im.instance_id
    where i.template_id = ${templateId}
  `
  const [submissions] = await sql`
    select count(*)::int as count
    from project_milestone_submissions s
    join project_instance_milestones im on im.id = s.instance_milestone_id
    join project_instances i on i.id = im.instance_id
    where i.template_id = ${templateId}
  `
  const [files] = await sql`
    select count(*)::int as count
    from project_milestone_files f
    join project_milestone_submissions s on s.id = f.submission_id
    join project_instance_milestones im on im.id = s.instance_milestone_id
    join project_instances i on i.id = im.instance_id
    where i.template_id = ${templateId}
  `

  return {
    phases: phases.count,
    milestones: milestones.count,
    instances: instances.count,
    instanceMilestones: instanceMilestones.count,
    submissions: submissions.count,
    files: files.count,
  }
}

try {
  const templates = idArg
    ? await sql`
        select id, title, status, course_id, created_at
        from project_templates
        where id = ${idArg}
      `
    : await sql`
        select id, title, status, course_id, created_at
        from project_templates
        where lower(trim(title)) = lower(trim(${titleArg}))
      `

  if (templates.length === 0) {
    console.log(
      idArg
        ? `No project template found with id ${idArg}`
        : `No project template found titled "${titleArg}"`
    )
    process.exitCode = 0
  } else {
    for (const template of templates) {
      const counts = await countsFor(template.id)
      console.log(
        JSON.stringify(
          {
            id: template.id,
            title: template.title,
            status: template.status,
            courseId: template.course_id,
            createdAt: template.created_at,
            dependents: counts,
          },
          null,
          2
        )
      )

      if (!apply) {
        console.log('Dry run: pass --apply to delete this template and its dependents.')
        continue
      }

      await sql.begin(async (tx) => {
        await tx`
          insert into audit_logs (action, resource_type, resource_id, metadata)
          values (
            'project.template.deleted',
            'project_template',
            ${template.id},
            ${JSON.stringify({
              title: template.title,
              courseId: template.course_id,
              source: 'delete-project-template-script',
              dependents: counts,
            })}::jsonb
          )
        `
        await tx`delete from project_templates where id = ${template.id}`
      })

      const remaining = await countsFor(template.id)
      const leftovers = Object.entries(remaining).filter(([, count]) => count > 0)
      if (leftovers.length > 0) {
        console.error(
          `Template row deleted but dependent rows remain: ${leftovers
            .map(([name, count]) => `${name}=${count}`)
            .join(', ')}`
        )
        process.exitCode = 1
      } else {
        console.log(`Deleted project template ${template.id} and all dependent data.`)
      }
    }
  }
} catch (error) {
  console.error(
    'Project template cleanup failed:',
    error instanceof Error ? error.message : error
  )
  process.exitCode = 1
} finally {
  await sql.end()
}
