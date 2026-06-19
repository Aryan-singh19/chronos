'use client'

import { useEffect, useState } from 'react'
import { LogIn, LogOut, ShieldCheck } from 'lucide-react'

interface SessionState {
  authenticated: boolean
  user?: { name: string; email: string }
  workspace?: { name: string; plan: string }
  role?: string
}

export function AuthControls() {
  const [session, setSession] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setSession(data))
      .finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/signin'
  }

  if (loading) {
    return (
      <div className="w-full rounded-lg bg-[rgb(var(--surface-2))] px-3 py-2 text-xs text-[rgb(var(--text-muted))]">
        Loading account...
      </div>
    )
  }

  if (!session?.authenticated) {
    return (
      <a
        href="/signin"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]"
      >
        <LogIn size={15} />
        Sign in
      </a>
    )
  }

  return (
    <div className="space-y-1">
      <div className="rounded-lg bg-[rgb(var(--surface-2))] px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]">
          <ShieldCheck size={12} />
          {session.workspace?.plan ?? 'Starter'} workspace
        </div>
        <p className="mt-1 text-sm font-medium text-[rgb(var(--text))]">{session.workspace?.name}</p>
        <p className="text-xs text-[rgb(var(--text-muted))]">{session.user?.email}</p>
      </div>
      <button
        onClick={signOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  )
}
