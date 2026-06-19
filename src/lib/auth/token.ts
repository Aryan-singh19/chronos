import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { env } from '@/lib/env'
import type { SessionPayload } from '@/lib/auth/session'

function getSecret() {
  return new TextEncoder().encode(env.AUTH_SECRET)
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as SessionPayload
}
