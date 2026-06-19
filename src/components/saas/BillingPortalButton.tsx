'use client'

import { useState } from 'react'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPortal = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? 'Unable to open billing portal.')
      }
      window.location.href = data.url
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to open billing portal.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={openPortal}
        disabled={loading}
        className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] transition hover:border-[rgb(var(--accent))] disabled:opacity-60"
      >
        {loading ? 'Opening...' : 'Manage billing'}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
