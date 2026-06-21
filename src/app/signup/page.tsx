import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, Sparkles, Users } from 'lucide-react'
import { AuthForm } from '@/components/saas/AuthForm'

export default function SignUpPage() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center gap-12 lg:flex-row">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.76)] px-4 py-2 text-sm text-[rgb(var(--text-muted))]">
            <Users size={14} className="text-[rgb(var(--accent))]" />
            Create your workspace
          </div>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold tracking-tight">
            Start planning with Chronos in minutes.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[rgb(var(--text-muted))]">
            Sign up to create your account, provision a workspace, and begin organizing launches,`r`n            research, and delivery work in one place.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Create your account, workspace, plan, and starter project in one flow',
              'Invite teammates when the workspace is ready to share',
              'Move from idea to timeline without setup friction',
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
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
            >
              Already have an account
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="surface-panel w-full max-w-md rounded-[32px] p-8">Loading...</div>
          }
        >
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </main>
  )
}


