'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderOpen } from 'lucide-react'
import { useProjectsStore } from '@/stores'
import { PROJECT_COLORS } from '@/lib/utils'

interface CreateProjectModalProps { onClose: () => void }

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const { createProject } = useProjectsStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    const project = await createProject({ name: name.trim(), description, color })
    setLoading(false)
    onClose()
    router.push(`/project/${project.id}/timeline/${project.timelineIds[0]}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[rgb(var(--surface))] rounded-2xl border border-[rgb(var(--border))] shadow-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">New Project</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]">
              <X size={18} />
            </button>
          </div>

          {/* Color + preview */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md transition-all" style={{ background: color }}>
              {name ? name[0].toUpperCase() : <FolderOpen size={24} />}
            </div>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1.5 block">Project Name *</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="My Awesome Project"
                className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[rgb(var(--text-muted))] mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={2}
                className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[rgb(var(--border))] text-sm font-medium hover:bg-[rgb(var(--surface-2))] transition-colors">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
              style={{ background: color }}
            >
              {loading ? 'Creating…' : 'Create Project'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
