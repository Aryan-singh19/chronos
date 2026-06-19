'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, FolderOpen, Clock, Settings, Moon, Sun,
  Monitor, Keyboard, CreditCard, Users, BarChart3,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useProjectsStore } from '@/stores'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { projects } = useProjectsStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const run = (fn: () => void) => {
    fn()
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.95, y: -10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -10, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl"
        >
          <Command className="rounded-2xl overflow-hidden shadow-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <div className="flex items-center gap-3 px-4 border-b border-[rgb(var(--border))]">
              <Search size={16} className="text-[rgb(var(--text-muted))]" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search projects, run commands…"
                className="flex-1 py-4 bg-transparent outline-none text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] text-sm"
                autoFocus
              />
              <kbd className="text-xs text-[rgb(var(--text-muted))] bg-[rgb(var(--surface-2))] px-2 py-1 rounded font-mono">ESC</kbd>
            </div>

            <Command.List className="max-h-[380px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                No results found.
              </Command.Empty>

              {/* Projects */}
              {projects.length > 0 && (
                <Command.Group heading={<span className="px-2 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Projects</span>}>
                  {projects.slice(0, 5).map((p) => (
                    <Command.Item
                      key={p.id}
                      value={`project ${p.name}`}
                      onSelect={() => run(() => router.push(`/project/${p.id}`))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: p.color }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-[rgb(var(--text-muted))]">{p.timelineIds.length} timelines</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Navigation */}
              <Command.Group heading={<span className="px-2 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Navigate</span>}>
                {[
                  { icon: BarChart3, label: 'Workspace Overview', action: () => router.push('/workspace') },
                  { icon: FolderOpen, label: 'Go to Dashboard', action: () => router.push('/dashboard') },
                  { icon: Users, label: 'Open Team Directory', action: () => router.push('/team') },
                  { icon: CreditCard, label: 'Open Billing', action: () => router.push('/billing') },
                  { icon: Settings, label: 'Open Settings', action: () => router.push('/settings') },
                  { icon: Clock, label: 'Recent Items', action: () => router.push('/recent') },
                ].map((item) => (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => run(item.action)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                  >
                    <item.icon size={16} className="text-[rgb(var(--text-muted))]" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Theme */}
              <Command.Group heading={<span className="px-2 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Theme</span>}>
                {[
                  { icon: Sun, label: 'Switch to Light Mode', action: () => setTheme('light') },
                  { icon: Moon, label: 'Switch to Dark Mode', action: () => setTheme('dark') },
                  { icon: Monitor, label: 'Use System Theme', action: () => setTheme('system') },
                ].map((item) => (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => run(item.action)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                  >
                    <item.icon size={16} className="text-[rgb(var(--text-muted))]" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Actions */}
              <Command.Group heading={<span className="px-2 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</span>}>
                <Command.Item
                  value="keyboard shortcuts"
                  onSelect={() => run(() => router.push('/settings?tab=shortcuts'))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                >
                  <Keyboard size={16} className="text-[rgb(var(--text-muted))]" />
                  View Keyboard Shortcuts
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="px-4 py-2.5 border-t border-[rgb(var(--border))] flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
              <span className="flex items-center gap-1"><kbd className="font-mono bg-[rgb(var(--surface-2))] px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-mono bg-[rgb(var(--surface-2))] px-1.5 py-0.5 rounded">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="font-mono bg-[rgb(var(--surface-2))] px-1.5 py-0.5 rounded">ESC</kbd> close</span>
            </div>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
