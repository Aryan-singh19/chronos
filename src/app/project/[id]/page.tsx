'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ChevronRight, Clock } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useProjectsStore, useTimelineStore } from '@/stores'
import { timelinesDB } from '@/lib/db'
import { formatRelative } from '@/lib/utils'
import type { Timeline } from '@/types'

export default function ProjectPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { projects, loadProjects, updateProject } = useProjectsStore()
  const { createTimeline } = useTimelineStore()
  const [projectTimelines, setProjectTimelines] = useState<Timeline[]>([])
  const [loading, setLoading] = useState(true)

  const project = projects.find((p) => p.id === id)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    Promise.all([loadProjects(), timelinesDB.getByProject(id)]).then(([, tls]) => {
      if (cancelled) return
      setProjectTimelines(tls.sort((a, b) => b.updatedAt - a.updatedAt))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id, loadProjects])

  const handleCreateTimeline = async () => {
    const tl = await createTimeline(id, { name: 'Untitled Timeline' })
    await updateProject(id, { timelineIds: [...(project?.timelineIds ?? []), tl.id] })
    router.push(`/project/${id}/timeline/${tl.id}`)
  }

  if (!project && loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!project) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-xl font-semibold mb-2">Project not found</h1>
            <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
              It may have been deleted from this browser or moved to another profile.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 bg-[rgb(var(--accent))] text-white px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'rgb(var(--accent))' }}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: project.color }}>
                {project.icon ?? project.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && <p className="text-[rgb(var(--text-muted))] text-sm mt-0.5">{project.description}</p>}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreateTimeline}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: project.color }}
            >
              <Plus size={16} />New Timeline
            </motion.button>
          </motion.div>

          {/* Timelines */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-[rgb(var(--surface-2))] animate-pulse" />
              ))}
            </div>
          ) : projectTimelines.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--surface-2))] flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-[rgb(var(--text-muted))]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No timelines yet</h3>
              <p className="text-[rgb(var(--text-muted))] text-sm mb-4">Create your first timeline to start mapping events.</p>
              <button onClick={handleCreateTimeline} className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: project.color }}>
                <Plus size={16} />Create Timeline
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectTimelines.map((tl, i) => (
                <motion.div
                  key={tl.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/project/${id}/timeline/${tl.id}`)}
                  className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-5 cursor-pointer hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: project.color + '22' }}>
                        <Clock size={16} style={{ color: project.color }} />
                      </div>
                      <h3 className="font-semibold truncate max-w-[200px]">{tl.name}</h3>
                    </div>
                    <ChevronRight size={16} className="text-[rgb(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-[rgb(var(--surface-2))] px-2 py-1 rounded-full text-[rgb(var(--text-muted))] capitalize">{tl.timeScale}</span>
                    <span className="text-xs bg-[rgb(var(--surface-2))] px-2 py-1 rounded-full text-[rgb(var(--text-muted))] capitalize">{tl.backgroundStyle}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(var(--border))]">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{tl.lanes.length} lanes</span>
                    <span className="text-xs text-[rgb(var(--text-muted))]">{formatRelative(tl.updatedAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
