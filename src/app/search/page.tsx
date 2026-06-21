'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Clock3, FolderOpen, Search, Shapes, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { nodesDB, timelinesDB } from '@/lib/db'
import { useProjectsStore } from '@/stores'
import type { Timeline, TimelineNode } from '@/types'

const SUGGESTED_QUERIES = ['launch', 'client', 'research', 'milestone', 'roadmap']

export default function SearchPage() {
  const { projects, loadProjects } = useProjectsStore()
  const [timelines, setTimelines] = useState<Timeline[]>([])
  const [nodes, setNodes] = useState<TimelineNode[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadProjects()
    Promise.all([timelinesDB.getAll(), nodesDB.getAll()]).then(([timelineItems, nodeItems]) => {
      setTimelines(timelineItems)
      setNodes(nodeItems)
    })
  }, [loadProjects])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []

    const projectMatches = projects
      .filter(
        (project) =>
          project.name.toLowerCase().includes(normalized) ||
          project.description?.toLowerCase().includes(normalized),
      )
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: project.description ?? 'Project workspace',
        type: 'Project',
        href: `/project/${project.id}`,
      }))

    const timelineMatches = timelines
      .filter(
        (timeline) =>
          timeline.name.toLowerCase().includes(normalized) ||
          timeline.description?.toLowerCase().includes(normalized),
      )
      .map((timeline) => ({
        id: `timeline-${timeline.id}`,
        title: timeline.name,
        subtitle: timeline.description ?? 'Timeline',
        type: 'Timeline',
        href: `/project/${timeline.projectId}/timeline/${timeline.id}`,
      }))

    const nodeMatches = nodes
      .filter(
        (node) =>
          node.title.toLowerCase().includes(normalized) ||
          node.description?.toLowerCase().includes(normalized),
      )
      .map((node) => {
        const timeline = timelines.find((item) => item.id === node.timelineId)

        return {
          id: `node-${node.id}`,
          title: node.title,
          subtitle: node.description || 'Timeline node',
          type: 'Node',
          href: timeline ? `/project/${timeline.projectId}/timeline/${timeline.id}` : '/search',
        }
      })

    return [...projectMatches, ...timelineMatches, ...nodeMatches].slice(0, 18)
  }, [nodes, projects, query, timelines])

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Global search</p>
            <h1 className="mt-1 text-3xl font-bold">Find any project, timeline, or node</h1>
            <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-muted))]">
              Search across the workspace and jump back into the exact project or timeline you need.
            </p>
          </div>

          <div className="surface-panel mb-6 rounded-[28px] p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.78)] px-4 py-3">
              <Search size={18} className="text-[rgb(var(--text-muted))]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search launches, clients, milestones, or research..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--text-muted))]"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((item) => (
                <button
                  key={item}
                  onClick={() => setQuery(item)}
                  className="rounded-full bg-[rgba(var(--surface-2),0.92)] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-muted))]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {query.trim() === '' ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: FolderOpen,
                    title: `${projects.length} projects`,
                    detail: 'Client workspaces and internal programs',
                  },
                  {
                    icon: Clock3,
                    title: `${timelines.length} timelines`,
                    detail: 'Launch schedules, research arcs, and plans',
                  },
                  {
                    icon: Shapes,
                    title: `${nodes.length} nodes`,
                    detail: 'Milestones, tasks, and key events',
                  },
                ].map((item) => (
                  <div key={item.title} className="metric-card rounded-[28px] p-5">
                    <item.icon size={18} className="mb-3 text-[rgb(var(--accent))]" />
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles size={16} />
                  <p className="text-sm font-medium">Search hints</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    'Search project names to jump between client workspaces quickly.',
                    'Use milestone words like "launch" or "alpha" to find timeline nodes.',
                    'Open search after a busy session to rediscover recently created structures.',
                    'Use this page for discovery when the command palette feels too narrow.',
                  ].map((hint) => (
                    <div
                      key={hint}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300"
                    >
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="surface-panel rounded-[28px] px-6 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-[rgb(var(--surface-2))]">
                    <Search size={24} className="text-[rgb(var(--text-muted))]" />
                  </div>
                  <p className="font-semibold">No matches for &quot;{query}&quot;</p>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
                    Try a broader keyword or search by project, milestone, or research theme.
                  </p>
                </div>
              ) : (
                results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="surface-panel block rounded-[26px] p-4 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{result.title}</p>
                        <p className="text-sm text-[rgb(var(--text-muted))]">{result.subtitle}</p>
                      </div>
                      <span className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1 text-xs font-medium text-[rgb(var(--text-muted))]">
                        {result.type}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
