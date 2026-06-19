import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { getCurrentMembership } from '@/lib/server/auth'
import { getStripe, getStripePriceId } from '@/lib/stripe'

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'GROWTH', 'ENTERPRISE']),
})

export async function POST(request: Request) {
  const membership = await getCurrentMembership()
  if (!membership) {
    return NextResponse.json({ ok: false, error: 'Please sign in first.' }, { status: 401 })
  }

  try {
    const body = checkoutSchema.parse(await request.json())
    const stripe = getStripe()
    const priceId = getStripePriceId(body.plan)

    await prisma.auditLog.create({
      data: {
        workspaceId: membership.workspaceId,
        userId: membership.userId,
        action: 'billing.checkout',
        targetType: 'subscription',
        metadata: JSON.stringify({ plan: body.plan }),
      },
    })

    if (!stripe || !priceId) {
      return NextResponse.json({
        ok: true,
        url: `/billing?checkout=demo&plan=${body.plan.toLowerCase()}`,
      })
    }

    const subscription = membership.workspace.subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.APP_URL}/billing?checkout=success`,
      cancel_url: `${env.APP_URL}/billing?checkout=canceled`,
      customer_email: membership.user.email,
      client_reference_id: membership.workspaceId,
      subscription_data: {
        metadata: {
          workspaceId: membership.workspaceId,
          plan: body.plan,
        },
      },
      customer: subscription?.stripeCustomerId ?? undefined,
      metadata: {
        workspaceId: membership.workspaceId,
        plan: body.plan,
      },
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start checkout.'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
