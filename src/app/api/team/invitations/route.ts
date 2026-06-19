import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { getCurrentMembership } from '@/lib/server/auth'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'BILLING', 'VIEWER']),
})

export async function POST(request: Request) {
  const membership = await getCurrentMembership()
  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    return NextResponse.json({ ok: false, error: 'You do not have permission to invite members.' }, { status: 403 })
  }

  try {
    const body = inviteSchema.parse(await request.json())
    const token = randomUUID()
    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: membership.workspaceId,
        email: body.email.toLowerCase(),
        role: body.role,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        invitedById: membership.userId,
      },
    })

    await prisma.auditLog.create({
      data: {
        workspaceId: membership.workspaceId,
        userId: membership.userId,
        action: 'team.invite',
        targetType: 'invitation',
        targetId: invitation.id,
        metadata: JSON.stringify({ email: invitation.email, role: invitation.role }),
      },
    })

    return NextResponse.json({
      ok: true,
      inviteUrl: `${env.APP_URL}/signup?invite=${invitation.token}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create invitation.'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
