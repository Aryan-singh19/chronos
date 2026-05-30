'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  FolderOpen,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
  ChevronLeft,
  Command,
  Bell,
  User,
  Activity,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/stores'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { SystemHealthWidget } from '@/components/ui/SystemHealthWidget'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  showSidebar?: boolean
}

const NAV_ITEMS = [
  { icon: FolderOpen, label: 'Projects', href: '/dashboard' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Clock, label: 'Recent', href: '/recent' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { settings, systemHealth } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg))]">
      {/* Desktop Sidebar */}
      {showSidebar && !isMobile && (
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex flex-col h-full bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))] overflow-hidden shrink-0"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(var(--border))]">
                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center" style={{ background: 'rgb(var(--accent))' }}>
                  <Clock size={16} className="text-white" />
                </div>
                <span className="font-bold text-base tracking-tight">Chronos</span>
              </div>

              {/* Search / Cmd+K */}
              <div className="px-3 py-3">
                <button
                  onClick={() => setCmdOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] text-sm transition-colors"
                >
                  <Command size={14} />
                  <span className="flex-1 text-left">Search or run command</span>
                  <kbd className="text-xs bg-[rgb(var(--border))] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(item.href)
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-2))]',
                      )}
                    >
                      <item.icon size={17} />
                      {item.label}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                        />
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Bottom: theme + profile */}
              <div className="px-3 py-3 border-t border-[rgb(var(--border))] space-y-1">
                {/* System health */}
                <button
                  onClick={() => setHealthOpen((o) => !o)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                    systemHealth.isHealthy
                      ? 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
                      : 'text-amber-600 bg-amber-50 dark:bg-amber-950',
                  )}
                >
                  <Activity size={15} />
                  <span className="flex-1 text-left">System Health</span>
                  <span className={cn('text-xs font-medium', systemHealth.isHealthy ? 'text-emerald-500' : 'text-amber-500')}>
                    {systemHealth.fps}fps
                  </span>
                </button>

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-2))] transition-all capitalize"
                >
                  <themeIcon size={15} />
                  {theme ?? 'system'} mode
                </button>

                {/* Profile */}
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-2))] transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[rgb(var(--accent))] flex items-center justify-center text-white text-xs font-bold" style={{ background: 'rgb(var(--accent))' }}>
                    {settings?.profile.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="flex-1 text-left truncate">{settings?.profile.name ?? 'User'}</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-[var(--topbar-height)] flex items-center gap-3 px-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] shrink-0">
          {showSidebar && !isMobile && (
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))] transition-all"
            >
              <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ type: 'spring', damping: 20 }}>
                <ChevronLeft size={18} />
              </motion.div>
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[rgb(var(--text-muted))] bg-[rgb(var(--surface-2))] hover:bg-[rgb(var(--border))] transition-all"
          >
            <Command size={13} />
            <span>⌘K</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[rgb(var(--surface))] border-t border-[rgb(var(--border))] flex items-center justify-around px-2 z-50">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                  active ? 'text-blue-600' : 'text-[rgb(var(--text-muted))]',
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div layoutId="mobile-nav" className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            )
          })}
        </nav>
      )}

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* System Health Widget */}
      <AnimatePresence>
        {healthOpen && <SystemHealthWidget onClose={() => setHealthOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
