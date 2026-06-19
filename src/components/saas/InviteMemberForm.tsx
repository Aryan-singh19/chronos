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
    <form onSubmit={submit} className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
      <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Invite teammate</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="teammate@company.com"
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-2.5 text-sm outline-none"
          required
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as (typeof ROLES)[number])}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-4 py-2.5 text-sm outline-none"
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
          className="rounded-xl bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send invite'}
        </button>
      </div>
      {message && <p className="mt-3 text-xs text-[rgb(var(--text-muted))]">{message}</p>}
    </form>
  )
}
