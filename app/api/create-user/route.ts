<<<<<<< HEAD
// app/api/create-user/route.ts
// Admin-only endpoint for creating accounts with a specific role.
import { eq, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, users } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth/server'
import { hashPassword } from '@/lib/auth/password'
import { isUserRole } from '@/lib/auth/types'
import { toPublicUser } from '@/lib/auth/users'
import {
  normalizeEmail,
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/auth/validation'

export async function POST(req: Request) {
  const authResult = await requireRole(['super_admin'])
  if (!authResult.success) {
    return authResult.response
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = normalizeUsername(body.username)
  const email = normalizeEmail(body.email)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const role = isUserRole(body.role) ? body.role : 'student'

  const validationError =
    validateUsername(username) || validateEmail(email) || validatePassword(password)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Username or email is already registered' },
      { status: 409 }
    )
  }

  const [firstName, ...restName] = name.split(/\s+/).filter(Boolean)
  const displayName = name || username

  try {
    const user = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          username,
          email,
          passwordHash: await hashPassword(password),
          role,
        })
        .returning()

      const [profile] = await tx
        .insert(profiles)
        .values({
          userId: newUser.id,
          name: displayName,
          fullName: displayName,
          firstName: firstName || null,
          lastName: restName.length ? restName.join(' ') : null,
          email,
          role,
        })
        .returning()

      return { ...newUser, profile }
    })

    return NextResponse.json({ user: toPublicUser(user, user.profile) }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === '23505') {
      return NextResponse.json(
        { error: 'Username or email is already registered' },
        { status: 409 }
      )
    }
    console.error('[create-user]', error)
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 })
  }
}
=======
//app/api/create-user/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔥 SERVER SIDE CLIENT
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("REQ BODY:", body)

    const { clerkId, name, email } = body

    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 })
    }

    // 🔥 check existing
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .maybeSingle()

    if (existing) {
      console.log("USER ALREADY EXISTS")
      return NextResponse.json({ message: 'User already exists' })
    }

    // 🔥 insert
    const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        clerk_id: clerkId,
        name: name || 'User',
        role: 'student'
      },
      { onConflict: 'clerk_id' }
    )

    if (error) {
      console.error("INSERT ERROR:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log("USER CREATED SUCCESS")

    return NextResponse.json({ message: 'User created' })

  } catch (err) {
    console.error("SERVER ERROR:", err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
>>>>>>> 2f7d3a232363d3d766bff65e4cb13ada689e9ee8
