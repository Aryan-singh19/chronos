import { NextResponse } from 'next/server'
import { z } from 'zod'
import { bootstrapWorkspaceAccount } from '@/lib/server/workspace-bootstrap'
import { SESSION_COOKIE, signSession } from '@/lib/auth/session'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(2).optional(),
})

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json())
    const result = await bootstrapWorkspaceAccount(body)
    const token = await signSession({
      userId: result.user.id,
      workspaceId: result.workspace.id,
      role: result.membership.role,
      sessionVersion: result.user.sessionVersion,
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
    const message = error instanceof Error ? error.message : 'Unable to create account.'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
