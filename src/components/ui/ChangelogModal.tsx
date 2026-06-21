'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, Bug } from 'lucide-react'

const CHANGELOG = [
  {
    version: '1.0.0',
    date: '2025',
    highlights: ['Initial release of Chronos', 'Local-first infinite timeline builder'],
    changes: [
      { type: 'new' as const, text: 'Infinite 2D canvas with pan, zoom, and grid snapping' },
      { type: 'new' as const, text: 'Multiple views: Timeline, Gantt, Kanban, Calendar' },
      { type: 'new' as const, text: 'AI-powered smart tagging, summaries, and date inference' },
      { type: 'new' as const, text: 'Full offline PWA support with IndexedDB storage' },
      { type: 'new' as const, text: 'Export to JSON, CSV, PDF, and HTML' },
      { type: 'new' as const, text: 'Rich text editor with code blocks and formatting' },
      { type: 'new' as const, text: 'Command palette (Ctrl + K) for fast navigation' },
      { type: 'new' as const, text: 'Version history and snapshots for timelines' },
      { type: 'new' as const, text: 'Dark, light, and system theme support' },
    ],
  },
]

const typeIcons = { new: Sparkles, improved: Zap, fixed: Bug }
const typeColors = { new: 'text-blue-500', improved: 'text-amber-500', fixed: 'text-emerald-500' }

export function ChangelogModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('chronos_changelog_seen')
    if (seen !== '1.0.0') {
      setTimeout(() => setOpen(true), 1500)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('chronos_changelog_seen', '1.0.0')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-2xl"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">What&apos;s New in Chronos</h2>
                    <p className="text-sm text-blue-200">Version 1.0.0 — Initial release</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-xl p-2 transition-colors hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-6">
              {CHANGELOG[0].changes.map((change, index) => {
                const Icon = typeIcons[change.type]
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-start gap-3 py-2"
                  >
                    <Icon size={14} className={`mt-0.5 shrink-0 ${typeColors[change.type]}`} />
                    <span className="text-sm text-[rgb(var(--text))]">{change.text}</span>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-6 py-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Built with care · Local-first · Zero cost
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Let&apos;s go
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
