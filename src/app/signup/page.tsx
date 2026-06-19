import { Suspense } from 'react'
import { AuthForm } from '@/components/saas/AuthForm'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center gap-12">
        <div className="flex-1">
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Launch-ready SaaS foundation</p>
          <h1 className="mt-2 max-w-2xl text-5xl font-bold tracking-tight">
            Create the first real Chronos customer account.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[rgb(var(--text-muted))]">
            Signup now provisions a user, workspace, membership, starter subscription, seed project, and billing-ready backend.
          </p>
        </div>
        <Suspense fallback={<div className="w-full max-w-md rounded-[32px] border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8">Loading...</div>}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </main>
  )
}
