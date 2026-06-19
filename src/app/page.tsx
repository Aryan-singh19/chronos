'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { PRODUCT_UPDATES, SAAS_PLANS } from '@/lib/saas'
import { useAppStore } from '@/stores'

export default function RootPage() {
  const { initialize } = useAppStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <main className="min-h-screen overflow-y-auto bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <section className="relative isolate overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.15),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--accent))] text-white shadow-lg">
                <Layers3 size={20} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">Chronos Cloud</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  Timeline intelligence for teams that ship
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/billing"
                className="text-sm font-medium text-[rgb(var(--text-muted))] transition hover:text-[rgb(var(--text))]"
              >
                Pricing
              </Link>
              <a
                href="https://chronos-rho-six.vercel.app/api/health"
                className="text-sm font-medium text-[rgb(var(--text-muted))] transition hover:text-[rgb(var(--text))]"
              >
                Status
              </a>
              <Link
                href="/signin"
                className="text-sm font-medium text-[rgb(var(--text-muted))] transition hover:text-[rgb(var(--text))]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Start free
              </Link>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.84)] px-4 py-2 text-sm text-[rgb(var(--text-muted))] shadow-sm"
              >
                <Sparkles size={14} className="text-[rgb(var(--accent))]" />
                From local-first canvas to full SaaS operating system
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl"
              >
                Plan launches, map research, and run collaborative timelines in one clean product.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-5 max-w-2xl text-lg leading-8 text-[rgb(var(--text-muted))]"
              >
                Chronos now feels like a launch-ready SaaS with a premium shell around the original
                infinite timeline engine: auth, teams, analytics, billing, and product operations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                >
                  Create workspace
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.86)] px-5 py-3 text-sm font-semibold text-[rgb(var(--text))] transition hover:border-[rgb(var(--accent))]"
                >
                  Open existing account
                </Link>
              </motion.div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Users,
                    title: 'Team-ready',
                    detail: 'Shared workspaces, roles, invites, and activity views',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Private by default',
                    detail: 'Local-first architecture with export control and secure sessions',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Operator visibility',
                    detail: 'Billing, adoption, and execution layers on top of the core canvas',
                  },
                ].map((item) => (
                  <div key={item.title} className="surface-panel rounded-[28px] p-5">
                    <item.icon size={18} className="text-[rgb(var(--accent))]" />
                    <p className="mt-4 font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {[
                  {
                    icon: Activity,
                    label: 'System health',
                    value: 'Healthy',
                    meta: 'Production database and auth routes are online',
                  },
                  {
                    icon: CreditCard,
                    label: 'Billing stack',
                    value: 'Stripe-ready',
                    meta: 'Checkout, portal, prices, and webhooks are wired',
                  },
                  {
                    icon: Globe2,
                    label: 'Live app',
                    value: 'chronos-rho-six',
                    meta: 'Running on Vercel with Prisma Postgres',
                  },
                ].map((item) => (
                  <div key={item.label} className="metric-card rounded-[28px] p-5">
                    <item.icon size={18} className="text-[rgb(var(--accent))]" />
                    <p className="mt-4 text-sm font-medium text-[rgb(var(--text-muted))]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-bold">{item.value}</p>
                    <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 }}
              className="section-shell surface-panel rounded-[32px] p-6"
            >
              <div className="relative rounded-[28px] border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.88)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
                      Recommended plan
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">{SAAS_PLANS[1].name}</h2>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Most Popular
                  </div>
                </div>

                <p className="mt-4 text-4xl font-bold">
                  ${SAAS_PLANS[1].priceMonthly}
                  <span className="text-base font-medium text-[rgb(var(--text-muted))]"> /mo</span>
                </p>

                <div className="mt-6 space-y-3">
                  {[SAAS_PLANS[1].seats, SAAS_PLANS[1].storage, SAAS_PLANS[1].support].map(
                    (feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl bg-[rgba(var(--surface),0.86)] px-4 py-3"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-slate-50">
                  <p className="text-sm font-medium text-slate-400">What changed in this upgrade</p>
                  <div className="mt-4 space-y-3">
                    {PRODUCT_UPDATES.map((update) => (
                      <div key={update} className="flex items-start gap-3 text-sm">
                        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{update}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.8)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
                    Start here
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href="/signup"
                      className="rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Launch workspace
                    </Link>
                    <Link
                      href="/workspace"
                      className="rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold"
                    >
                      View product shell
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
