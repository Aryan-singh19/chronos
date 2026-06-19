import { NextResponse } from 'next/server'
import { getCurrentMembership } from '@/lib/server/auth'

export async function GET() {
  const membership = await getCurrentMembership()
  if (!membership) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
    },
    workspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      plan: membership.workspace.plan,
    },
    role: membership.role,
  })
}
