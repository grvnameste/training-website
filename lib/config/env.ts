import { logger } from '@/lib/observability/logger'

const REQUIRED = ['DATABASE_URL', 'SESSION_SECRET'] as const
const RECOMMENDED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
] as const

export function validateEnv() {
  if (process.env.NEXT_RUNTIME === 'edge') return

  const missing = REQUIRED.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }

  const recommendedMissing = RECOMMENDED.filter((key) => !process.env[key])
  if (recommendedMissing.length > 0) {
    logger.warn('Optional environment variables are missing', {
      missing: recommendedMissing,
    })
  }
}
