import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'components', 'hooks', 'lib', 'types']

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) results.push(...walk(path))
    else if (/\.(ts|tsx)$/.test(entry)) results.push(path)
  }
  return results
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
const violations = []

const anonImports = files.filter((file) =>
  readFileSync(file, 'utf8').includes('@/lib/supabase/client')
)
if (anonImports.length > 0) {
  violations.push(
    `${anonImports.length} client files still import @/lib/supabase/client:\n  ${anonImports
      .map((file) => file.replace(ROOT + '\\', ''))
      .join('\n  ')}`
  )
}

const nextConfig = readFileSync(join(ROOT, 'next.config.mjs'), 'utf8')
if (nextConfig.includes('ignoreBuildErrors')) {
  violations.push('next.config.mjs still ignores TypeScript build errors')
}

for (const route of [
  'app/api/db/course/create/route.ts',
  'app/api/db/course/list/route.ts',
]) {
  try {
    statSync(join(ROOT, route))
    violations.push(`Unauthenticated legacy route still exists: ${route}`)
  } catch {
    // expected to be absent
  }
}

const removedIntegrations = files.filter((file) => {
  const source = readFileSync(file, 'utf8')
  return /\b(trello|strapi)\b/i.test(source)
})
if (removedIntegrations.length > 0) {
  violations.push(
    `Removed integrations are still referenced:\n  ${removedIntegrations
      .map((file) => file.replace(ROOT + '\\', ''))
      .join('\n  ')}`
  )
}

try {
  const envExample = readFileSync(join(ROOT, '.env.example'), 'utf8')
  if (/\b(TRELLO|STRAPI)_/i.test(envExample)) {
    violations.push('.env.example still contains Trello or Strapi variables')
  }
} catch {
  // no env example
}

const sourceFiles = [
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'lib')),
].filter((file) => !file.includes('route.ts'))

const placeholderKey = sourceFiles.filter((file) =>
  readFileSync(file, 'utf8').includes("SUPABASE_SERVICE_ROLE_KEY ||")
)
if (placeholderKey.length > 0) {
  violations.push(
    `API code still falls back to placeholders for the service key:\n  ${placeholderKey
      .map((file) => file.replace(ROOT + '\\', ''))
      .join('\n  ')}`
  )
}

if (violations.length > 0) {
  console.log('Phase 1 invariants:')
  for (const violation of violations) console.log(`- ${violation}`)
  if (process.env.STRICT_INVARIANTS === '1') process.exitCode = 1
} else {
  console.log('Phase 1 invariants passed')
}
