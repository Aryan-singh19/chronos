import { cookies } from 'next/headers'
import type { MembershipRole } from '@prisma/client'
import { signSessionToken, verifySessionToken } from '@/lib/auth/token'

export const SESSION_COOKIE = 'chronos_session'

export interface SessionPayload {
  userId: string
  workspaceId: string
  role: MembershipRole
  sessionVersion: number
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

export async function signSession(payload: SessionPayload) {
  return signSessionToken(payload)
}
