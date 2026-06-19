import { AppShell } from '@/components/layout/AppShell'
import { requireCurrentMembership } from '@/lib/server/auth'
import { getWorkspaceOverview } from '@/lib/server/saas'

export const dynamic = 'force-dynamic'

export default async function WorkspacePage() {
  const membership = await requireCurrentMembership()
  const overview = await getWorkspaceOverview(membership.workspaceId)

  if (!overview) {
    return null
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace overview</p>
              <h1 className="mt-1 text-3xl font-bold">{overview.workspace.name}</h1>
              <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                Signed in as {membership.user.name} and operating on the {overview.planLabel} plan.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">Billing status</p>
              <p className="mt-1 text-lg font-bold capitalize">{overview.billingStatus.toLowerCase()}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="mt-1 text-sm font-medium">{metric.label}</p>
                <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">{metric.change}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
              <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace snapshot</p>
              <div className="mt-5 space-y-3 text-sm text-[rgb(var(--text-muted))]">
                <p>Slug: {overview.workspace.slug}</p>
                <p>Current plan: {overview.planLabel}</p>
                <p>Subscription state: {overview.billingStatus.toLowerCase()}</p>
                <p>Created: {overview.workspace.createdAt.toDateString()}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-slate-950 p-6 text-slate-50">
              <p className="text-sm font-medium text-slate-400">Operator note</p>
              <p className="mt-4 text-lg font-semibold">
                Chronos is now backed by real identity, memberships, subscriptions, and server data.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                The local-first canvas still matters, but the product now has the architecture to become a true multi-user SaaS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
