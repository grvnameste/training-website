import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session'

const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/courses',
  '/about',
  '/contact',
  '/education',
  '/privacyPolicy',
  '/privacy-policy',
  '/termsCondition',
  '/terms',
  '/for-students',
  '/for-institution',
  '/Forstudents',
  '/Forinstitution',
  '/api/contact',
  '/api/video',
  '/api/catalog',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/health',
  '/api/internal',
]

const TEACHER_ROUTE_PREFIXES = [
  '/teacher',
  '/api/teacher',
  '/api/capstone/approve',
]

function matchesRoutePrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return matchesRoutePrefix(pathname, PUBLIC_ROUTE_PREFIXES)
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (
    matchesRoutePrefix(pathname, TEACHER_ROUTE_PREFIXES) &&
    session.role !== 'super_admin' &&
    session.role !== 'teacher'
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient privileges' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/student/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
