import { NextResponse } from 'next/server'
import { getClientIp } from './request'

interface Bucket {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>
}

const buckets =
  globalForRateLimit.__rateLimitBuckets ?? new Map<string, Bucket>()

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.__rateLimitBuckets = buckets
}

function pruneExpired(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * In-memory fixed-window limiter. It protects a single server instance; for
 * multi-instance deployments move the bucket to Redis or the database.
 */
export function enforceRateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now()
  pruneExpired(now)

  const ip = getClientIp(req) ?? 'unknown'
  const key = `${name}:${ip}`
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  existing.count += 1
  if (existing.count <= limit) return null

  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again shortly.',
      code: 'RATE_LIMITED',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Reset': String(Math.ceil(existing.resetAt / 1000)),
      },
    }
  )
}
