'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  FolderOpen,
  Clock,
  Star,
  Archive,
  Search,
  Settings,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react'
import { useAppStore, useProjectsStore } from '@/stores'
import { AppShell } from '@/components/layout/AppShell'
import { CreateProjectModal } from '@/components/modals/CreateProjectModal'
import { formatRelative } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/utils'

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

  const filtered = projects.filter((p) =>
    filter === 'all' ? true : filter === 'archived' ? p.isArchived : !p.isArchived,
  )

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-sm text-[rgb(var(--text-muted))] font-medium">
              {greeting}, {settings?.profile.name ?? 'there'} 👋
            </p>
            <h1 className="text-3xl font-bold mt-1">Your Projects</h1>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'text-blue-500' },
              { label: 'Active', value: projects.filter((p) => !p.isArchived).length, icon: Star, color: 'text-amber-500' },
              { label: 'Recent', value: settings?.recentItems.length ?? 0, icon: Clock, color: 'text-emerald-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon size={18} className={stat.color} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-[rgb(var(--surface-2))] rounded-lg p-1">
              {(['all', 'active', 'archived'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                    filter === f
                      ? 'bg-[rgb(var(--surface))] shadow-sm text-[rgb(var(--text))]'
                      : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-[rgb(var(--surface-2))] rounded-lg p-1">
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
                className="flex items-center gap-2 bg-[rgb(var(--accent))] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: 'rgb(var(--accent))' }}
              >
                <Plus size={16} />
                New Project
              </motion.button>
            </div>
          </div>

          {/* Projects grid/list */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--surface-2))] flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-[rgb(var(--text-muted))]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-[rgb(var(--text-muted))] text-sm mb-4">
                Create your first project to start building timelines.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-[rgb(var(--accent))] text-white px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: 'rgb(var(--accent))' }}
              >
                <Plus size={16} />
                Create Project
              </button>
            </motion.div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'flex flex-col gap-2'
              }
            >
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5 cursor-pointer hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ background: project.color }}
                    >
                      {project.icon ?? project.name[0].toUpperCase()}
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-[rgb(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    />
                  </div>
                  <h3 className="font-semibold text-[rgb(var(--text))] mb-1 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-[rgb(var(--text-muted))] line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgb(var(--border))]">
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {project.timelineIds.length} timeline{project.timelineIds.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[rgb(var(--text-muted))]">
                      {formatRelative(project.updatedAt)}
                    </span>
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
