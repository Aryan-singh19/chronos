import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE, signSession } from '@/lib/auth/session'

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const body = signinSchema.parse(await request.json())
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!user) {
      throw new Error('No account found for that email.')
    }

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) {
      throw new Error('Incorrect password.')
    }

    const membership = user.memberships[0]
    if (!membership) {
      throw new Error('No active workspace membership found.')
    }

    const token = await signSession({
      userId: user.id,
      workspaceId: membership.workspaceId,
      role: membership.role,
      sessionVersion: user.sessionVersion,
    })

    const response = NextResponse.json({
      ok: true,
      redirectTo: '/workspace',
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
