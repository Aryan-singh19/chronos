import { PlanTier } from '@prisma/client'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

function normalizePlan(plan?: string | null): PlanTier | null {
  if (plan === 'STARTER' || plan === 'GROWTH' || plan === 'ENTERPRISE') {
    return plan
  }
  return null
}

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === 'active') return 'ACTIVE' as const
  if (status === 'trialing') return 'TRIALING' as const
  if (status === 'past_due') return 'PAST_DUE' as const
  return 'CANCELED' as const
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const signature = request.headers.get('stripe-signature')

  if (!stripe || !env.STRIPE_WEBHOOK_SECRET || !signature) {
    return new Response('Stripe webhook is not configured.', { status: 400 })
  }

  const payload = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const workspaceId = session.metadata?.workspaceId
    const plan = normalizePlan(session.metadata?.plan)
    if (workspaceId && plan) {
      await prisma.subscription.upsert({
        where: { workspaceId },
        update: {
          plan,
          status: 'ACTIVE',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === 'string' ? session.subscription : null,
        },
        create: {
          workspaceId,
          plan,
          status: 'ACTIVE',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === 'string' ? session.subscription : undefined,
        },
      })
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan },
      })
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const workspaceId = subscription.metadata?.workspaceId
    const plan = normalizePlan(subscription.metadata?.plan)

    if (workspaceId && plan) {
      await prisma.subscription.upsert({
        where: { workspaceId },
        update: {
          plan,
          status: normalizeSubscriptionStatus(subscription.status),
          stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          workspaceId,
          plan,
          status: normalizeSubscriptionStatus(subscription.status),
          stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : undefined,
          stripeSubscriptionId: subscription.id,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan },
      })
    }
  }

  return new Response('ok')
}
