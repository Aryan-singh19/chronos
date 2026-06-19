'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, Clock, Star, ChevronRight, LayoutGrid, List, Sparkles } from 'lucide-react'
import { useAppStore, useProjectsStore } from '@/stores'
import { AppShell } from '@/components/layout/AppShell'
import { CreateProjectModal } from '@/components/modals/CreateProjectModal'
import { formatRelative } from '@/lib/utils'
import { buildActivityFeed, getCurrentPlan } from '@/lib/saas'

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

  const filtered = projects.filter((project) =>
    filter === 'all' ? true : filter === 'archived' ? project.isArchived : !project.isArchived,
  )

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const plan = getCurrentPlan(projects)
  const activityFeed = buildActivityFeed(settings?.recentItems ?? [], projects)

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
              {greeting}, {settings?.profile.name ?? 'there'}
            </p>
            <h1 className="mt-1 text-3xl font-bold">Your Projects</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace momentum</p>
                  <h2 className="mt-1 text-2xl font-bold">{plan.name} plan active</h2>
                  <p className="mt-2 max-w-xl text-sm text-[rgb(var(--text-muted))]">
                    Chronos now presents your timeline studio like a SaaS workspace, with room for collaborators, billing, and reporting.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Launch-ready
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {[plan.seats, plan.storage, plan.support].map((feature) => (
                  <span key={feature} className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-muted))]">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[rgb(var(--border))] bg-slate-950 p-6 text-slate-50">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={16} />
                <p className="text-sm font-medium">Recent workspace activity</p>
              </div>
              <div className="mt-4 space-y-3">
                {activityFeed.length === 0 ? (
                  <p className="text-sm text-slate-400">Open projects and timelines to build a live operator feed.</p>
                ) : (
                  activityFeed.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {[
              { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'text-blue-500' },
              { label: 'Active', value: projects.filter((project) => !project.isArchived).length, icon: Star, color: 'text-amber-500' },
              { label: 'Recent', value: settings?.recentItems.length ?? 0, icon: Clock, color: 'text-emerald-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <stat.icon size={18} className={stat.color} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-[rgb(var(--surface-2))] p-1">
              {(['all', 'active', 'archived'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
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
              <div className="flex items-center gap-0.5 rounded-lg bg-[rgb(var(--surface-2))] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]' : 'text-[rgb(var(--text-muted))]'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))]' : 'text-[rgb(var(--text-muted))]'}`}
                >
                  <List size={16} />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-[rgb(var(--accent))] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'rgb(var(--accent))' }}
              >
                <Plus size={16} />
                New Project
              </motion.button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--surface-2))]">
                <FolderOpen size={32} className="text-[rgb(var(--text-muted))]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
              <p className="mb-4 text-sm text-[rgb(var(--text-muted))]">
                Create your first project to start building timelines.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: 'rgb(var(--accent))' }}
              >
                <Plus size={16} />
                Create Project
              </button>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2'}>
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="group cursor-pointer rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5 transition-all hover:shadow-card-hover"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
                      style={{ background: project.color }}
                    >
                      {project.icon ?? project.name[0].toUpperCase()}
                    </div>
                    <ChevronRight
                      size={16}
                      className="mt-1 text-[rgb(var(--text-muted))] opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <h3 className="mb-1 truncate font-semibold text-[rgb(var(--text))]">{project.name}</h3>
                  {project.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-[rgb(var(--text-muted))]">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between border-t border-[rgb(var(--border))] pt-2">
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {project.timelineIds.length} timeline{project.timelineIds.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{formatRelative(project.updatedAt)}</span>
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

