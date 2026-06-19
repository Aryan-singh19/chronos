import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { AuthForm } from '@/components/saas/AuthForm'

export default function SignInPage() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center gap-12 lg:flex-row">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.76)] px-4 py-2 text-sm text-[rgb(var(--text-muted))]">
            <ShieldCheck size={14} className="text-[rgb(var(--accent))]" />
            Secure workspace access
          </div>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold tracking-tight">
            The timeline engine now has real accounts, workspaces, and revenue rails.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[rgb(var(--text-muted))]">
            Sign in to your SaaS workspace and manage product launches, team members, and billing from one place.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Protected sessions with workspace context',
              'Stripe billing and portal access built in',
              'Team roles, invites, and audit-ready actions',
              'Local-first product core with SaaS overlays',
            ].map((item) => (
              <div key={item} className="surface-panel rounded-[24px] p-4 text-sm text-[rgb(var(--text-muted))]">
                <div className="flex items-start gap-3">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-[rgb(var(--accent))]" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold"
            >
              Back to site
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
            >
              Create account
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="surface-panel w-full max-w-md rounded-[32px] p-8">Loading...</div>
          }
        >
          <AuthForm mode="signin" />
        </Suspense>
      </div>
    </main>
  )
}
