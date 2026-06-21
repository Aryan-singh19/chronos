import { CheckCircle2 } from 'lucide-react'
import { BillingCheckoutButton } from '@/components/saas/BillingCheckoutButton'
import { BillingPortalButton } from '@/components/saas/BillingPortalButton'
import { AppShell } from '@/components/layout/AppShell'
import { requireCurrentMembership } from '@/lib/server/auth'
import { getWorkspaceBilling } from '@/lib/server/saas'

const PLAN_ORDER: Array<'STARTER' | 'GROWTH' | 'ENTERPRISE'> = ['STARTER', 'GROWTH', 'ENTERPRISE']

const PLAN_COPY = {
  STARTER: {
    price: '$19',
    description: 'Best for solo builders starting out.',
    features: ['1 workspace owner', 'Private timeline engine', 'Manual exports'],
  },
  GROWTH: {
    price: '$79',
    description: 'For active teams and design partners.',
    features: ['Up to 15 collaborators', 'Invite flows and billing portal', 'Priority support'],
  },
  ENTERPRISE: {
    price: '$249',
    description: 'For serious enterprise rollout and support.',
    features: ['Advanced rollout support', 'High-touch onboarding', 'Longer retention windows'],
  },
} as const

function getBillingBanner(
  checkout?: string,
  portal?: string,
): { tone: 'success' | 'warning' | 'info'; title: string; detail: string } | null {
  if (checkout === 'success') {
    return {
      tone: 'success',
      title: 'Plan update in progress',
      detail: 'Stripe has the request. Your workspace will reflect the new plan after checkout and sync complete.',
    }
  }
  if (checkout === 'canceled') {
    return {
      tone: 'warning',
      title: 'Checkout canceled',
      detail: 'Nothing changed. You can restart the upgrade whenever you are ready.',
    }
  }
  if (checkout === 'demo') {
    return {
      tone: 'info',
      title: 'Preview checkout mode',
      detail: 'Stripe was unavailable, so Chronos used a safe preview path instead.',
    }
  }
  if (portal === 'demo') {
    return {
      tone: 'info',
      title: 'Preview billing portal',
      detail: 'No Stripe customer exists for this workspace yet, so Chronos showed the fallback path.',
    }
  }
  return null
}

export const dynamic = 'force-dynamic'

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { checkout?: string; portal?: string }
}) {
  const membership = await requireCurrentMembership()
  const billing = await getWorkspaceBilling(membership.workspaceId)

  if (!billing) {
    return null
  }

  const banner = getBillingBanner(searchParams?.checkout, searchParams?.portal)

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Billing and plans</p>
            <h1 className="mt-1 text-3xl font-bold">Plans and billing</h1>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              Current plan: {billing.currentPlan}. Review pricing, switch plans, and manage billing
              without leaving the workspace.
            </p>
          </div>

          {banner && (
            <div
              className={`mb-6 rounded-[28px] border px-5 py-4 ${
                banner.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : banner.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.92)] text-[rgb(var(--text-muted))]'
              }`}
            >
              <p className="font-semibold">{banner.title}</p>
              <p className="mt-1 text-sm">{banner.detail}</p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            {PLAN_ORDER.map((plan) => (
              <div
                key={plan}
                className={
                  plan === 'GROWTH'
                    ? 'rounded-[30px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]'
                    : 'surface-panel rounded-[30px] p-6'
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-bold">{plan.charAt(0) + plan.slice(1).toLowerCase()}</p>
                  {billing.currentPlan.toUpperCase() === plan && (
                    <span
                      className={
                        plan === 'GROWTH'
                          ? 'rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300'
                          : 'rounded-full bg-[rgba(var(--accent),0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent))]'
                      }
                    >
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-4 text-4xl font-bold">
                  {PLAN_COPY[plan].price}
                  <span
                    className={
                      plan === 'GROWTH'
                        ? 'text-base font-medium text-slate-400'
                        : 'text-base font-medium text-[rgb(var(--text-muted))]'
                    }
                  >
                    {' '}
                    /mo
                  </span>
                </p>
                <p
                  className={
                    plan === 'GROWTH'
                      ? 'mt-2 text-sm text-slate-400'
                      : 'mt-2 text-sm text-[rgb(var(--text-muted))]'
                  }
                >
                  {PLAN_COPY[plan].description}
                </p>

                <div className="mt-5 space-y-3">
                  {PLAN_COPY[plan].features.map((feature) => (
                    <div
                      key={feature}
                      className={
                        plan === 'GROWTH'
                          ? 'flex items-center gap-3 rounded-2xl bg-slate-900/75 px-4 py-3 text-sm text-slate-200'
                          : 'flex items-center gap-3 rounded-2xl bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm'
                      }
                    >
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <BillingCheckoutButton plan={plan} />
                </div>
              </div>
            ))}
          </div>

          <div className="surface-panel mt-8 rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Billing activity</p>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                  Recent invoices and subscription events for this workspace.
                </p>
              </div>
              <BillingPortalButton />
            </div>

            <div className="mt-4 space-y-3">
              {billing.invoices.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">No billing activity yet.</p>
              ) : (
                billing.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[rgba(var(--surface-2),0.92)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{invoice.label}</p>
                      <p className="text-sm text-[rgb(var(--text-muted))]">{invoice.issuedOn}</p>
                    </div>
                    <p className="font-semibold">{invoice.amount}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
