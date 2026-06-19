import Stripe from 'stripe'
import { env } from '@/lib/env'

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) return null
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createNodeHttpClient(),
  })
}

export function getStripePriceId(plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE') {
  if (plan === 'ENTERPRISE') return env.STRIPE_ENTERPRISE_PRICE_ID
  if (plan === 'GROWTH') return env.STRIPE_GROWTH_PRICE_ID
  return env.STRIPE_STARTER_PRICE_ID
}
