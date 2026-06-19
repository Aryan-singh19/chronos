'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

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
    <div className="w-full max-w-md rounded-[32px] border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
        {mode === 'signup' ? 'Create your SaaS workspace' : 'Welcome back'}
      </p>
      <h1 className="mt-2 text-3xl font-bold">
        {mode === 'signup' ? 'Start with Chronos Cloud' : 'Sign in to Chronos'}
      </h1>
      <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
        {mode === 'signup'
          ? 'Provision a real account, seeded workspace, and billing-ready SaaS foundation.'
          : 'Access your team workspace, timeline data, and billing controls.'}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'signup' && (
          <>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-3 text-sm outline-none"
              required
            />
            <input
              value={form.workspaceName}
              onChange={(event) => setForm((current) => ({ ...current, workspaceName: event.target.value }))}
              placeholder="Workspace name"
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-3 text-sm outline-none"
            />
          </>
        )}

        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          type="email"
          placeholder="you@company.com"
          className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-3 text-sm outline-none"
          required
        />
        <input
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          type="password"
          placeholder="Password"
          className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-3 text-sm outline-none"
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[rgb(var(--accent))] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
        {mode === 'signup' ? 'Already have an account?' : 'Need a new workspace?'}{' '}
        <Link href={mode === 'signup' ? '/signin' : '/signup'} className="font-semibold text-[rgb(var(--accent))]">
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  )
}
