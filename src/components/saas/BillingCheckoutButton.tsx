'use client'

import { useState } from 'react'

export function BillingCheckoutButton({ plan }: { plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? 'Unable to start checkout.')
      }
      window.location.href = data.url
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to start checkout.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={startCheckout}
        disabled={loading}
        className="w-full rounded-2xl bg-[rgb(var(--accent))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60"
      >
        {loading ? 'Redirecting...' : `Choose ${plan.toLowerCase()}`}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
