'use client'

import { useState } from 'react'

const ROLES = ['ADMIN', 'MEMBER', 'BILLING', 'VIEWER'] as const

export function InviteMemberForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof ROLES)[number]>('MEMBER')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/team/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? 'Unable to send invitation.')
      }
      setMessage(`Invite created for ${email}. Link: ${data.inviteUrl}`)
      setEmail('')
      setRole('MEMBER')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to send invitation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="surface-panel rounded-[28px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Invite teammate</p>
          <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
            Grant the right role and send a secure workspace invitation.
          </p>
        </div>
        <div className="rounded-full bg-[rgba(var(--accent),0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent))]">
          Team access
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="teammate@company.com"
          className="rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))]"
          required
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as (typeof ROLES)[number])}
          className="rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))]"
        >
          {ROLES.map((roleValue) => (
            <option key={roleValue} value={roleValue}>
              {roleValue}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)] disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send invite'}
        </button>
      </div>
      {message && (
        <p className="mt-3 rounded-2xl bg-[rgba(var(--surface-2),0.9)] px-4 py-3 text-xs text-[rgb(var(--text-muted))]">
          {message}
        </p>
      )}
    </form>
  )
}
