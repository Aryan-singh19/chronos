import { z } from 'zod'

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/chronos?schema=public'),
  AUTH_SECRET: z.string().min(32).default('chronos-dev-secret-change-me-please-1234'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_GROWTH_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),
})

export const env = envSchema.parse({
  DATABASE_URL: normalizeEnvValue(process.env.DATABASE_URL),
  AUTH_SECRET: normalizeEnvValue(process.env.AUTH_SECRET),
  APP_URL: normalizeEnvValue(process.env.APP_URL),
  STRIPE_SECRET_KEY: normalizeEnvValue(process.env.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: normalizeEnvValue(process.env.STRIPE_WEBHOOK_SECRET),
  STRIPE_STARTER_PRICE_ID: normalizeEnvValue(process.env.STRIPE_STARTER_PRICE_ID),
  STRIPE_GROWTH_PRICE_ID: normalizeEnvValue(process.env.STRIPE_GROWTH_PRICE_ID),
  STRIPE_ENTERPRISE_PRICE_ID: normalizeEnvValue(process.env.STRIPE_ENTERPRISE_PRICE_ID),
})
