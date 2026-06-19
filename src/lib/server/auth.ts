import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function getCurrentMembership() {
  const session = await getSession()
  if (!session) return null

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.userId,
        workspaceId: session.workspaceId,
      },
    },
    include: {
      user: true,
      workspace: {
        include: {
          subscription: true,
        },
      },
    },
  })

  if (!membership || membership.user.sessionVersion !== session.sessionVersion) {
    return null
  }

  return membership
}

export async function requireCurrentMembership() {
  const membership = await getCurrentMembership()
  if (!membership) {
    redirect('/signin')
  }
  return membership
}
