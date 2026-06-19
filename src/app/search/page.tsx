'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, FolderOpen, Clock3, Shapes } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useProjectsStore } from '@/stores'
import { nodesDB, timelinesDB } from '@/lib/db'
import type { Timeline, TimelineNode } from '@/types'

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
      .filter((project) => project.name.toLowerCase().includes(normalized))
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: project.description ?? 'Project workspace',
        type: 'Project',
      }))

    const timelineMatches = timelines
      .filter((timeline) => timeline.name.toLowerCase().includes(normalized))
      .map((timeline) => ({
        id: `timeline-${timeline.id}`,
        title: timeline.name,
        subtitle: timeline.description ?? 'Timeline',
        type: 'Timeline',
      }))

    const nodeMatches = nodes
      .filter((node) => node.title.toLowerCase().includes(normalized))
      .map((node) => ({
        id: `node-${node.id}`,
        title: node.title,
        subtitle: node.description || 'Timeline node',
        type: 'Node',
      }))

    return [...projectMatches, ...timelineMatches, ...nodeMatches].slice(0, 18)
  }, [nodes, projects, query, timelines])

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Global search</p>
            <h1 className="mt-1 text-3xl font-bold">Find any project, timeline, or node</h1>
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3">
            <Search size={18} className="text-[rgb(var(--text-muted))]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search launches, clients, milestones..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--text-muted))]"
            />
          </div>

          {query.trim() === '' ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: FolderOpen, title: `${projects.length} projects`, detail: 'Client workspaces and internal programs' },
                { icon: Clock3, title: `${timelines.length} timelines`, detail: 'Launch schedules, research arcs, and plans' },
                { icon: Shapes, title: `${nodes.length} nodes`, detail: 'Milestones, tasks, and key events' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
                  <item.icon size={18} className="mb-3 text-[rgb(var(--accent))]" />
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{item.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] px-6 py-12 text-center text-sm text-[rgb(var(--text-muted))]">
                  No matching records yet.
                </div>
              ) : (
                results.map((result) => (
                  <div key={result.id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{result.title}</p>
                        <p className="text-sm text-[rgb(var(--text-muted))]">{result.subtitle}</p>
                      </div>
                      <span className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1 text-xs font-medium text-[rgb(var(--text-muted))]">
                        {result.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

