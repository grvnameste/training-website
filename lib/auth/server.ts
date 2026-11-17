import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { companies, companyMemberships, profiles, users } from '@/lib/db/schema'
import { SESSION_COOKIE, verifySession } from './session'
import { getActiveSession } from './session-store'
import { permissionsFor, type Permission } from './permissions'
import type { CompanySummary, MembershipRole, UserRole } from './types'
import { normalizeRole, provisionProfile } from './users'

export type { UserRole } from './types'

export interface AuthProfile {
  id: string
  user_id: string
  company_id: string | null
  username: string
  name: string
  first_name?: string
  last_name?: string
  email?: string
  role: UserRole
  avatar?: string
  about?: string
  projects?: any[]
  skills?: any[]
  resume_data?: any
}

export interface AuthContext {
  userId: string
  sessionId: string
  user: {
    id: string
    username: string
    email: string
    role: UserRole
    status: string
  }
  profile: AuthProfile
  role: UserRole
  companies: CompanySummary[]
  permissions: Permission[]
}

type CredentialUser = typeof users.$inferSelect
type ProfileRow = typeof profiles.$inferSelect

function toAuthProfile(user: CredentialUser, profile: ProfileRow): AuthProfile {
  return {
    id: profile.id,
    user_id: user.id,
    company_id: profile.companyId ?? null,
    username: user.username,
    name: profile.name || profile.fullName || user.username,
    first_name: profile.firstName ?? undefined,
    last_name: profile.lastName ?? undefined,
    email: profile.email || user.email,
    role: normalizeRole(user.role),
    avatar: profile.avatarUrl ?? profile.avatar ?? undefined,
    about: profile.about ?? undefined,
    projects: Array.isArray(profile.projects) ? profile.projects : undefined,
    skills: Array.isArray(profile.skills) ? profile.skills : undefined,
    resume_data: profile.resumeData ?? undefined,
  }
}

async function loadCompanies(userId: string): Promise<CompanySummary[]> {
  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      role: companyMemberships.role,
    })
    .from(companyMemberships)
    .innerJoin(companies, eq(companies.id, companyMemberships.companyId))
    .where(
      and(
        eq(companyMemberships.userId, userId),
        eq(companyMemberships.status, 'active'),
        eq(companies.status, 'active')
      )
    )

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    role: row.role as MembershipRole,
  }))
}

/**
 * Resolves the signed-in user from the session cookie, verifies the session
 * record has not been revoked, and loads current credentials + profile.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await verifySession(token)
    if (!session) return null

    const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1)
    if (!user || user.status !== 'active') return null

    const activeSession = await getActiveSession(session.sid, user.id)
    if (!activeSession) return null

    let [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    if (!profile) {
      profile = await provisionProfile(user)
    }

    const role = normalizeRole(user.role)
    const memberships = await loadCompanies(user.id)

    return {
      userId: user.id,
      sessionId: session.sid,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role,
        status: user.status,
      },
      profile: toAuthProfile(user, profile),
      role,
      companies: memberships,
      permissions: permissionsFor(role, memberships),
    }
  } catch (error) {
    console.error('[lib/auth/server] Authentication context error:', error)
    throw error
  }
}

/**
 * Enforces that the request is made by an authenticated user.
 */
export async function requireAuth(): Promise<
  | { success: true; context: AuthContext }
  | { success: false; response: NextResponse }
> {
  const context = await getAuthContext()
  if (!context) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    }
  }
  return { success: true, context }
}

function matchesAllowedRole(context: AuthContext, allowedRoles: string[]): boolean {
  if (context.role === 'super_admin') return true
  if (allowedRoles.includes(context.role)) return true

  const membershipRoles = new Set(context.companies.map((company) => company.role))
  if (allowedRoles.includes('teacher')) {
    if (membershipRoles.has('instructor') || membershipRoles.has('org_admin')) return true
  }
  if (allowedRoles.includes('super_admin') && membershipRoles.has('org_admin')) {
    return true
  }
  return false
}

/**
 * Enforces role-based access control. Membership roles are mapped to the legacy
 * teacher/admin roles so existing route guards keep working.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<
  | { success: true; context: AuthContext }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult
  }

  if (!matchesAllowedRole(authResult.context, allowedRoles)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Forbidden: Insufficient privileges for this action' },
        { status: 403 }
      ),
    }
  }

  return authResult
}
