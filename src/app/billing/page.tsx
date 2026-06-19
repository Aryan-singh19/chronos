import { BillingPortalButton } from '@/components/saas/BillingPortalButton'
import { BillingCheckoutButton } from '@/components/saas/BillingCheckoutButton'
import { AppShell } from '@/components/layout/AppShell'
import { requireCurrentMembership } from '@/lib/server/auth'
import { getWorkspaceBilling } from '@/lib/server/saas'

const PLAN_ORDER: Array<'STARTER' | 'GROWTH' | 'ENTERPRISE'> = ['STARTER', 'GROWTH', 'ENTERPRISE']

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const membership = await requireCurrentMembership()
  const billing = await getWorkspaceBilling(membership.workspaceId)

  if (!billing) {
    return null
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Billing and plans</p>
            <h1 className="mt-1 text-3xl font-bold">Subscription controls</h1>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              Current plan: {billing.currentPlan}. Stripe checkout is wired with a graceful local demo fallback.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PLAN_ORDER.map((plan) => (
              <div key={plan} className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
                <p className="text-xl font-bold">{plan.charAt(0) + plan.slice(1).toLowerCase()}</p>
                <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                  {plan === 'STARTER'
                    ? 'Best for solo builders starting out.'
                    : plan === 'GROWTH'
                      ? 'For active teams and design partners.'
                      : 'For serious enterprise rollout and support.'}
                </p>
                <div className="mt-6">
                  <BillingCheckoutButton plan={plan} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Billing activity</p>
              <BillingPortalButton />
            </div>
            <div className="mt-4 space-y-3">
              {billing.invoices.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">No billing activity yet.</p>
              ) : (
                billing.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[rgb(var(--surface-2))] px-4 py-3">
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
