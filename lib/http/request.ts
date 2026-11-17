import { ApiError, forbidden } from './errors'

export function getClientIp(req: Request): string | null {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
}

export function getUserAgent(req: Request): string | null {
  return req.headers.get('user-agent')
}

/**
 * Mitigates cross-site state-changing requests for cookie-authenticated routes.
 * Non-browser callers without an Origin header are allowed through.
 */
export function assertSameOrigin(req: Request) {
  if (req.method === 'GET' || req.method === 'HEAD') return

  const origin = req.headers.get('origin')
  if (!origin) return

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!host) return

  try {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      throw forbidden('Cross-site request rejected')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw forbidden('Invalid request origin')
  }
}

export async function parseJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON')
  }
}
