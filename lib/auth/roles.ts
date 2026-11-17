import type { CompanySummary, UserRole } from './types'

export function canAccessInstructorPortal(
  role: UserRole,
  companies: CompanySummary[] = []
): boolean {
  if (role === 'super_admin' || role === 'teacher') return true
  return companies.some(
    (company) => company.role === 'instructor' || company.role === 'org_admin'
  )
}

export function canAccessAdminPortal(
  role: UserRole,
  companies: CompanySummary[] = []
): boolean {
  if (role === 'super_admin') return true
  return companies.some((company) => company.role === 'org_admin')
}

export function defaultPortal(role: UserRole, companies: CompanySummary[] = []): 'instructor' | 'student' {
  return canAccessInstructorPortal(role, companies) ? 'instructor' : 'student'
}
