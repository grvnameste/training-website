import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth/server'
import type { PublicUser } from '@/lib/auth/types'

export async function GET() {
  const context = await getAuthContext()
  if (!context) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const user: PublicUser = {
    id: context.profile.id,
    userId: context.userId,
    username: context.profile.username,
    email: context.profile.email ?? '',
    name: context.profile.name,
    firstName: context.profile.first_name ?? null,
    lastName: context.profile.last_name ?? null,
    avatarUrl: context.profile.avatar ?? null,
    role: context.role,
    companies: context.companies,
    permissions: context.permissions,
  }

  return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } })
}
