'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    workspaceName: '',
    email: '',
    password: '',
  })

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const payload =
      mode === 'signup'
        ? form
        : {
            email: form.email,
            password: form.password,
          }

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? 'Authentication failed.')
      }

      const next = searchParams.get('next')
      router.push(next || data.redirectTo || '/workspace')
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.')
      setLoading(false)
    }
  }

  return (
    <div className="surface-panel w-full max-w-md rounded-[32px] p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.72)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
          {mode === 'signup' ? (
            <Sparkles size={13} className="text-[rgb(var(--accent))]" />
          ) : (
            <LockKeyhole size={13} className="text-[rgb(var(--accent))]" />
          )}
          {mode === 'signup' ? 'Create workspace' : 'Secure sign in'}
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
          {mode === 'signup' ? 'Trial ready' : 'Protected'}
        </div>
      </div>

      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {mode === 'signup' ? 'Start with Chronos Cloud' : 'Welcome back to Chronos'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[rgb(var(--text-muted))]">
        {mode === 'signup'
          ? 'Provision a real account, seeded workspace, and billing-ready SaaS foundation in one step.'
          : 'Access your workspace, project timelines, team controls, and subscription settings.'}
      </p>

      <div className="mt-5 grid gap-2 rounded-3xl border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.7)] p-4">
        {[
          mode === 'signup'
            ? 'Workspace, membership, and starter plan are created automatically'
            : 'Cookie session, workspace context, and protected routes are restored securely',
          'Stripe-backed billing flows and team invitations are ready',
        ].map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm text-[rgb(var(--text-muted))]">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'signup' && (
          <>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:bg-[rgb(var(--surface))]"
              required
            />
            <input
              value={form.workspaceName}
              onChange={(event) =>
                setForm((current) => ({ ...current, workspaceName: event.target.value }))
              }
              placeholder="Workspace name"
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:bg-[rgb(var(--surface))]"
            />
          </>
        )}

        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          type="email"
          placeholder="you@company.com"
          className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:bg-[rgb(var(--surface))]"
          required
        />
        <input
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          type="password"
          placeholder="Password"
          className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:bg-[rgb(var(--surface))]"
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--accent))] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60"
        >
          {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
        {mode === 'signup' ? 'Already have an account?' : 'Need a new workspace?'}{' '}
        <Link
          href={mode === 'signup' ? '/signin' : '/signup'}
          className="font-semibold text-[rgb(var(--accent))]"
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  )
}
