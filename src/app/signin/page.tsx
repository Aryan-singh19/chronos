import { Suspense } from 'react'
import { AuthForm } from '@/components/saas/AuthForm'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center gap-12">
        <div className="flex-1">
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Chronos Cloud</p>
          <h1 className="mt-2 max-w-2xl text-5xl font-bold tracking-tight">
            The timeline engine now has real accounts, workspaces, and revenue rails.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[rgb(var(--text-muted))]">
            Sign in to your SaaS workspace and manage product launches, team members, and billing from one place.
          </p>
        </div>
        <Suspense fallback={<div className="w-full max-w-md rounded-[32px] border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8">Loading...</div>}>
          <AuthForm mode="signin" />
        </Suspense>
      </div>
    </main>
  )
}
