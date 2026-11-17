export type UserRole = 'student' | 'teacher' | 'super_admin'

export type MembershipRole = 'org_admin' | 'instructor' | 'mentor' | 'student'

export type Portal = 'student' | 'instructor' | 'admin'

export const USER_ROLES: UserRole[] = ['student', 'teacher', 'super_admin']

export const MEMBERSHIP_ROLES: MembershipRole[] = [
  'org_admin',
  'instructor',
  'mentor',
  'student',
]

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as string[]).includes(value)
}

export function isMembershipRole(value: unknown): value is MembershipRole {
  return typeof value === 'string' && (MEMBERSHIP_ROLES as string[]).includes(value)
}

export interface CompanySummary {
  id: string
  name: string
  slug: string
  role: MembershipRole
}

export interface PublicUser {
  id: string
  userId: string
  username: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  role: UserRole
  companies?: CompanySummary[]
  permissions?: string[]
}
