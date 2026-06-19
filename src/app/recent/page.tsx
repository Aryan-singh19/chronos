'use client'

import { History, ArrowUpRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore, useProjectsStore } from '@/stores'
import { formatRelative } from '@/lib/utils'
import { useEffect } from 'react'

export default function RecentPage() {
  const { settings } = useAppStore()
  const { projects, loadProjects } = useProjectsStore()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const projectMap = new Map(projects.map((project) => [project.id, project.name]))
  const recentItems = settings?.recentItems ?? []

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Recent activity</p>
            <h1 className="mt-1 text-3xl font-bold">Pick up where your team left off</h1>
          </div>

          {recentItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[rgb(var(--border))] px-6 py-16 text-center">
              <History size={28} className="mx-auto mb-3 text-[rgb(var(--text-muted))]" />
              <p className="font-semibold">No recent records yet</p>
              <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                Open a project or timeline and Chronos will keep your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
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
                      <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">{formatRelative(item.visitedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Recovery-friendly workflow</p>
                <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                  Recent activity, command palette, and local-first snapshots keep your team moving fast.
                </p>
              </div>
              <ArrowUpRight size={18} className="text-[rgb(var(--accent))]" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
