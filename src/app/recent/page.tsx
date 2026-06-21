'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight, History, Search, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { formatRelative } from '@/lib/utils'
import { useAppStore, useProjectsStore } from '@/stores'

export default function RecentPage() {
  const { settings } = useAppStore()
  const { projects, loadProjects } = useProjectsStore()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const projectMap = new Map(projects.map((project) => [project.id, project.name]))
  const recentItems = settings?.recentItems ?? []
  const projectByTimelineId = new Map(
    projects.flatMap((project) => project.timelineIds.map((timelineId) => [timelineId, project.id] as const)),
  )

  const getHref = (item: (typeof recentItems)[number]) => {
    if (item.type === 'project') {
      return `/project/${item.id}`
    }

    const projectId = item.projectId ?? (item.timelineId ? projectByTimelineId.get(item.timelineId) : undefined)
    const timelineId = item.timelineId ?? (item.type === 'timeline' ? item.id : undefined)

    if (projectId && timelineId) {
      return `/project/${projectId}/timeline/${timelineId}`
    }

    return '/dashboard'
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Recent activity</p>
            <h1 className="mt-1 text-3xl font-bold">Pick up where you left off</h1>
            <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-muted))]">
              Chronos keeps a lightweight memory of your recent work so it is easy to jump back in
              after meetings, reviews, and context switches.
            </p>
          </div>

          {recentItems.length === 0 ? (
            <div className="surface-panel rounded-[30px] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[rgb(var(--surface-2))]">
                <History size={28} className="text-[rgb(var(--text-muted))]" />
              </div>
              <p className="font-semibold">No recent records yet</p>
              <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                Open a project or timeline and Chronos will keep your history here automatically.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open projects
                </Link>
                <Link
                  href="/search"
                  className="rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold"
                >
                  Search workspace
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={getHref(item)}
                  className="surface-panel block rounded-[26px] p-4 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                        {item.type} in {projectMap.get(item.projectId ?? '') ?? 'your workspace'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]">
                        {item.type}
                      </p>
                      <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                        {formatRelative(item.visitedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Recovery-friendly workflow</p>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                    Recent activity, search, and local-first snapshots make it easy to re-enter work
                    after context switching.
                  </p>
                </div>
                <ArrowUpRight size={18} className="text-[rgb(var(--accent))]" />
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={16} />
                <p className="text-sm font-medium">Next helpful move</p>
              </div>
              <div className="mt-4 space-y-3">
                <Link
                  href="/search"
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm"
                >
                  Search across workspace data
                  <Search size={15} className="text-slate-400" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm"
                >
                  Return to projects dashboard
                  <ArrowUpRight size={15} className="text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
