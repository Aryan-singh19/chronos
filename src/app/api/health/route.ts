import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return NextResponse.json({ ok: true, status: 'build' })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, status: 'healthy' })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 503 },
    )
  }
}
