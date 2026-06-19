# Chronos Production Deployment

## Recommended stack

- Hosting: Vercel
- Database: Prisma Postgres via the Vercel Marketplace
- Billing: Stripe Checkout, Billing Portal, and Webhooks
- ORM and migrations: Prisma ORM with `prisma migrate deploy`

## Environment variables

Configure these in Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_GROWTH_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_WORKSPACE_NAME`

## Deployment flow

1. Import the repository into Vercel.
2. In Vercel `Storage`, create and connect a Prisma Postgres database.
3. Add the rest of the environment variables from `.env.example`.
4. Add Stripe recurring prices for Starter, Growth, and Enterprise.
5. Point a Stripe webhook to `/api/stripe/webhook`.
6. Deploy the app.
7. Apply migrations with `npx prisma migrate deploy`.
8. Seed the first workspace with `npm run db:seed`.

## Operational endpoints

- `/api/health`
- `/api/stripe/webhook`
- `/api/billing/checkout`
- `/api/billing/portal`

## Local and CI commands

```bash
npm run db:generate
npm run db:migrate:dev -- --name init
npm run db:migrate:deploy
npm run db:seed
npm run admin:create
```
