'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  Star,
  Target,
  Users,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CreateProjectModal } from '@/components/modals/CreateProjectModal'
import { buildActivityFeed, getCurrentPlan } from '@/lib/saas'
import { formatRelative } from '@/lib/utils'
import { useAppStore, useProjectsStore } from '@/stores'

export default function DashboardPage() {
  const router = useRouter()
  const { settings } = useAppStore()
  const { projects, loadProjects } = useProjectsStore()
  const [showCreate, setShowCreate] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filtered = useMemo(
    () =>
      projects.filter((project) =>
        filter === 'all' ? true : filter === 'archived' ? project.isArchived : !project.isArchived,
      ),
    [filter, projects],
  )

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const plan = getCurrentPlan(projects)
  const activityFeed = buildActivityFeed(settings?.recentItems ?? [], projects)
  const activeProjects = projects.filter((project) => !project.isArchived).length
  const archivedProjects = projects.filter((project) => project.isArchived).length

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
                  {greeting}, {settings?.profile.name ?? 'there'}
                </p>
                <h1 className="mt-1 text-3xl font-bold">Project workspace</h1>
                <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-muted))]">
                  This is your operating layer for launches, client programs, and roadmap execution.
                  Build timelines, revisit active work, and keep momentum visible across the workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)]"
                >
                  <Plus size={16} />
                  New project
                </button>
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold"
                >
                  Workspace overview
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel rounded-[30px] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace momentum</p>
                  <h2 className="mt-1 text-2xl font-bold">{plan.name} plan active</h2>
                  <p className="mt-2 max-w-xl text-sm text-[rgb(var(--text-muted))]">
                    Your product shell now supports teams, billing, and operator visibility without
                    losing the speed of the original local-first project studio.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Launch-ready
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[plan.seats, plan.storage, plan.support].map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-[rgba(var(--surface-2),0.9)] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-muted))]"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: FolderOpen,
                    label: 'Total projects',
                    value: String(projects.length),
                    detail: `${activeProjects} active · ${archivedProjects} archived`,
                  },
                  {
                    icon: Target,
                    label: 'Execution health',
                    value: filtered.length === 0 ? 'Quiet' : 'Live',
                    detail:
                      filtered.length === 0
                        ? 'No filtered projects visible'
                        : `${filtered.length} project${filtered.length === 1 ? '' : 's'} in current view`,
                  },
                  {
                    icon: Users,
                    label: 'Recent visits',
                    value: String(settings?.recentItems.length ?? 0),
                    detail: 'Feeds search, recents, and command context',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="metric-card rounded-[24px] p-4">
                    <stat.icon size={18} className="text-[rgb(var(--accent))]" />
                    <p className="mt-4 text-2xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium">{stat.label}</p>
                    <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={16} />
                <p className="text-sm font-medium">Recent workspace activity</p>
              </div>
              <div className="mt-4 space-y-3">
                {activityFeed.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="font-medium">No activity captured yet</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Open a project or timeline and Chronos will build a lightweight operator feed
                      here automatically.
                    </p>
                  </div>
                ) : (
                  activityFeed.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Onboarding hint
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Start with one flagship project, map its main timeline, then invite collaborators
                  once the structure feels stable.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-2xl bg-[rgb(var(--surface-2))] p-1">
              {(['all', 'active', 'archived'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                    filter === value
                      ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm'
                      : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-2xl bg-[rgb(var(--surface-2))] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]'
                      : 'text-[rgb(var(--text-muted))]'
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]'
                      : 'text-[rgb(var(--text-muted))]'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="surface-panel rounded-[30px] px-6 py-16 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[rgb(var(--surface-2))]">
                <FolderOpen size={32} className="text-[rgb(var(--text-muted))]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
              </h3>
              <p className="mx-auto mb-5 max-w-md text-sm text-[rgb(var(--text-muted))]">
                {filter === 'all'
                  ? 'Create your first project to start building timelines, milestones, and launch systems.'
                  : `Switch filters or create a new project to populate this ${filter} view.`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-medium text-white"
                >
                  <Plus size={16} />
                  Create project
                </button>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] px-5 py-2.5 text-sm font-medium"
                >
                  Open search
                </Link>
              </div>
            </motion.div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-3'
              }
            >
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="surface-panel group cursor-pointer rounded-[28px] p-5"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                      style={{ background: project.color }}
                    >
                      {project.icon ?? project.name[0].toUpperCase()}
                    </div>
                    <ArrowRight
                      size={16}
                      className="mt-1 text-[rgb(var(--text-muted))] opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>

                  <h3 className="mb-1 truncate font-semibold text-[rgb(var(--text))]">
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="mb-4 line-clamp-2 text-sm text-[rgb(var(--text-muted))]">
                      {project.description}
                    </p>
                  ) : (
                    <p className="mb-4 text-sm text-[rgb(var(--text-muted))]">
                      Add a short description to make this project easier to scan for your team.
                    </p>
                  )}

                  <div className="rounded-2xl bg-[rgba(var(--surface-2),0.92)] px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-[rgb(var(--text-muted))]">
                      <span>
                        {project.timelineIds.length} timeline
                        {project.timelineIds.length !== 1 ? 's' : ''}
                      </span>
                      <span>{formatRelative(project.updatedAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </AppShell>
  )
}
