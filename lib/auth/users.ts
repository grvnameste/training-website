import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { isUserRole, type PublicUser, type UserRole } from './types'

export function normalizeRole(role: unknown): UserRole {
  return isUserRole(role) ? role : 'student'
}

interface CredentialUser {
  id: string
  username: string
  email: string
  role: string
}

interface ProfileRecord {
  id: string
  email: string | null
  name: string | null
  fullName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export function toPublicUser(user: CredentialUser, profile: ProfileRecord | null): PublicUser {
  return {
    id: profile?.id ?? user.id,
    userId: user.id,
    username: user.username,
    email: profile?.email || user.email,
    name: profile?.name || profile?.fullName || user.username,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    role: normalizeRole(user.role),
  }
}

/**
 * Credential records always need a matching profile row. Legacy/seeded users
 * created without one get it here on first use.
 */
export async function provisionProfile(user: CredentialUser) {
  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      name: user.username,
      fullName: user.username,
      email: user.email,
      role: normalizeRole(user.role),
    })
    .returning()

  return profile
}
