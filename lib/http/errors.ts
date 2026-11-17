import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.status }
    )
  }

  console.error('[api] Unhandled error:', error)
  logger.exception('unhandled_api_error', error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, 'BAD_REQUEST', message, details)
}

export function unauthorized(message = 'Authentication required') {
  return new ApiError(401, 'UNAUTHORIZED', message)
}

export function forbidden(message = 'Insufficient privileges') {
  return new ApiError(403, 'FORBIDDEN', message)
}

export function notFound(message = 'Resource not found') {
  return new ApiError(404, 'NOT_FOUND', message)
}

export function conflict(code: string, message: string, details?: unknown) {
  return new ApiError(409, code, message, details)
}
