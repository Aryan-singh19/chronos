import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth/session'
import { verifySessionToken } from '@/lib/auth/token'

const PROTECTED_PATHS = [
  '/dashboard',
  '/project',
  '/settings',
  '/search',
  '/recent',
  '/workspace',
  '/team',
  '/billing',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, request.url))
  }

  try {
    await verifySessionToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/project/:path*', '/settings/:path*', '/search/:path*', '/recent/:path*', '/workspace/:path*', '/team/:path*', '/billing/:path*'],
}
