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
      { type: 'new' as const, text: 'AI-powered smart tagging, summaries & date inference' },
      { type: 'new' as const, text: 'Full offline PWA support with IndexedDB storage' },
      { type: 'new' as const, text: 'Export to JSON, CSV, PDF, and HTML' },
      { type: 'new' as const, text: 'Rich text editor with code blocks and formatting' },
      { type: 'new' as const, text: 'Command palette (⌘K) for fast navigation' },
      { type: 'new' as const, text: 'Version history / snapshots for timelines' },
      { type: 'new' as const, text: 'Dark/light/system theme support' },
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
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[rgb(var(--surface))] rounded-2xl border border-[rgb(var(--border))] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">What's New in Chronos</h2>
                    <p className="text-blue-200 text-sm">Version 1.0.0 — Initial Release 🎉</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-80 overflow-y-auto">
              {CHANGELOG[0].changes.map((change, i) => {
                const Icon = typeIcons[change.type]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 py-2"
                  >
                    <Icon size={14} className={`mt-0.5 shrink-0 ${typeColors[change.type]}`} />
                    <span className="text-sm text-[rgb(var(--text))]">{change.text}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
              <p className="text-xs text-[rgb(var(--text-muted))]">Built with ♥ · Local-first · Zero cost</p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Let's Go! 🚀
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
