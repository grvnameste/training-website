import type { CompanySummary, MembershipRole, UserRole } from './types'

export type Permission =
  | 'catalog.read'
  | 'course.learn'
  | 'course.manage'
  | 'course.publish'
  | 'entitlement.grant'
  | 'capstone.review'
  | 'certificate.issue'
  | 'student.view'
  | 'company.manage'
  | 'audit.read'

const MEMBERSHIP_PERMISSIONS: Record<MembershipRole, Permission[]> = {
  student: ['catalog.read', 'course.learn'],
  mentor: ['catalog.read', 'capstone.review', 'student.view'],
  instructor: ['catalog.read', 'course.manage', 'course.publish', 'capstone.review', 'certificate.issue', 'student.view'],
  org_admin: [
    'catalog.read',
    'course.manage',
    'course.publish',
    'entitlement.grant',
    'capstone.review',
    'certificate.issue',
    'student.view',
    'company.manage',
    'audit.read',
  ],
}

const ALL_PERMISSIONS: Permission[] = [
  'catalog.read',
  'course.learn',
  'course.manage',
  'course.publish',
  'entitlement.grant',
  'capstone.review',
  'certificate.issue',
  'student.view',
  'company.manage',
  'audit.read',
]

export function permissionsFor(
  role: UserRole,
  companies: CompanySummary[] = []
): Permission[] {
  if (role === 'super_admin') return ALL_PERMISSIONS

  const granted = new Set<Permission>()
  const legacyRole: MembershipRole = role === 'teacher' ? 'instructor' : 'student'
  for (const permission of MEMBERSHIP_PERMISSIONS[legacyRole]) {
    granted.add(permission)
  }
  for (const company of companies) {
    for (const permission of MEMBERSHIP_PERMISSIONS[company.role]) {
      granted.add(permission)
    }
  }
  return [...granted]
}

export function hasPermission(
  permissions: Permission[] | string[],
  permission: Permission
): boolean {
  return permissions.includes(permission)
}

export function hasCompanyRole(
  companies: CompanySummary[],
  companyId: string,
  roles: MembershipRole[]
): boolean {
  return companies.some(
    (company) => company.id === companyId && roles.includes(company.role)
  )
}
