import Link from 'next/link'
import { ArrowRight, CreditCard, ShieldCheck, Users } from 'lucide-react'
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
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace overview</p>
                <h1 className="mt-1 text-3xl font-bold">{overview.workspace.name}</h1>
                <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-muted))]">
                  Signed in as {membership.user.name}. Your workspace is operating on the{' '}
                  {overview.planLabel} plan with live auth, billing, and collaboration controls.
                </p>
              </div>
              <div className="rounded-[24px] border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.8)] px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
                  Billing status
                </p>
                <p className="mt-1 text-lg font-bold capitalize">
                  {overview.billingStatus.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
              >
                Manage team
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold"
              >
                Review billing
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.metrics.map((metric) => (
              <div key={metric.label} className="metric-card rounded-[28px] p-5">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="mt-1 text-sm font-medium">{metric.label}</p>
                <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">{metric.change}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="surface-panel rounded-[28px] p-6">
              <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace snapshot</p>
              <div className="mt-5 grid gap-3 text-sm text-[rgb(var(--text-muted))] sm:grid-cols-2">
                <p>Slug: {overview.workspace.slug}</p>
                <p>Current plan: {overview.planLabel}</p>
                <p>Subscription state: {overview.billingStatus.toLowerCase()}</p>
                <p>Created: {overview.workspace.createdAt.toDateString()}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
              <p className="text-sm font-medium text-slate-400">Workspace posture</p>
              <div className="mt-5 space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Secure identity',
                    detail: 'Protected sessions and role-aware memberships are active.',
                  },
                  {
                    icon: Users,
                    title: 'Collaboration ready',
                    detail: 'Invite flows and active member tracking are available.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Revenue rails',
                    detail: 'Stripe checkout and billing portal are production-wired.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-start gap-3">
                      <item.icon size={18} className="mt-0.5 text-cyan-300" />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
