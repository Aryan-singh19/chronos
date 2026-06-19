import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { getCurrentMembership } from '@/lib/server/auth'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const membership = await getCurrentMembership()
  if (!membership) {
    return NextResponse.json({ ok: false, error: 'Please sign in first.' }, { status: 401 })
  }

  const stripe = getStripe()
  const customerId = membership.workspace.subscription?.stripeCustomerId

  if (!stripe || !customerId) {
    return NextResponse.json({ ok: true, url: '/billing?portal=demo' })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.APP_URL}/billing`,
  })

  return NextResponse.json({ ok: true, url: session.url })
}
