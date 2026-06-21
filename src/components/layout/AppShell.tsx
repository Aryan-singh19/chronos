'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  ChevronLeft,
  Clock,
  Command,
  CreditCard,
  FolderOpen,
  Monitor,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { AuthControls } from '@/components/saas/AuthControls'
import { SystemHealthWidget } from '@/components/ui/SystemHealthWidget'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useAppStore } from '@/stores'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  showSidebar?: boolean
}

const NAV_ITEMS = [
  { icon: BarChart3, label: 'Workspace', href: '/workspace' },
  { icon: FolderOpen, label: 'Projects', href: '/dashboard' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: CreditCard, label: 'Billing', href: '/billing' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Clock, label: 'Recent', href: '/recent' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

function getPageLabel(pathname: string) {
  if (pathname.startsWith('/workspace')) return 'Workspace overview'
  if (pathname.startsWith('/billing')) return 'Plans and billing'
  if (pathname.startsWith('/team')) return 'People, roles, and invitations'
  if (pathname.startsWith('/dashboard')) return 'Projects and execution'
  if (pathname.startsWith('/search')) return 'Search and command navigation'
  if (pathname.startsWith('/recent')) return 'Recent visits and activity'
  return 'Chronos Cloud'
}

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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setCmdOpen(true)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {showSidebar && !isMobile && (
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="surface-panel m-3 mr-0 flex h-[calc(100%-1.5rem)] shrink-0 flex-col overflow-hidden rounded-[28px]"
            >
              <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--accent))] shadow-[0_10px_24px_rgba(37,99,235,0.26)]">
                  <Clock size={17} className="text-white" />
                </div>
                <div>
                  <span className="block text-base font-bold tracking-tight">Chronos</span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">Team timeline OS</span>
                </div>
              </div>

              <div className="px-3 py-3">
                <button
                  onClick={() => setCmdOpen(true)}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.92)] px-3 py-3 text-sm text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--text))]"
                >
                  <Command size={14} />
                  <span className="flex-1 text-left">Search or run command</span>
                  <kbd className="rounded-lg bg-[rgb(var(--border))] px-1.5 py-0.5 font-mono text-xs">Ctrl + K</kbd>
                </button>
              </div>

              <div className="px-3 pb-2">
                <div className="rounded-2xl bg-slate-950 px-4 py-4 text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.28)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    <Sparkles size={13} />
                    Product overview
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    Keep planning, collaboration, billing, and account controls within one focused workspace.
                  </p>
                </div>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto px-3">
                {NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(item.href)

                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300'
                          : 'text-[rgb(var(--text-muted))] hover:bg-[rgba(var(--surface-2),0.92)] hover:text-[rgb(var(--text))]',
                      )}
                    >
                      <item.icon size={17} />
                      {item.label}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500"
                        />
                      )}
                    </button>
                  )
                })}
              </nav>

              <div className="space-y-1 border-t border-[rgb(var(--border))] px-3 py-3">
                <button
                  onClick={() => setHealthOpen((open) => !open)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all',
                    systemHealth.isHealthy
                      ? 'text-[rgb(var(--text-muted))] hover:bg-[rgba(var(--surface-2),0.92)]'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950',
                  )}
                >
                  <Activity size={15} />
                  <span className="flex-1 text-left">System Health</span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      systemHealth.isHealthy ? 'text-emerald-500' : 'text-amber-500',
                    )}
                  >
                    {systemHealth.fps}fps
                  </span>
                </button>

                <button
                  onClick={() =>
                    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
                  }
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm capitalize text-[rgb(var(--text-muted))] transition-all hover:bg-[rgba(var(--surface-2),0.92)] hover:text-[rgb(var(--text))]"
                >
                  <ThemeIcon size={15} />
                  {theme ?? 'system'} mode
                </button>

                <button
                  onClick={() => router.push('/settings')}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-[rgb(var(--text-muted))] transition-all hover:bg-[rgba(var(--surface-2),0.92)] hover:text-[rgb(var(--text))]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-xs font-bold text-white">
                    {settings?.profile.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="flex-1 truncate text-left">{settings?.profile.name ?? 'User'}</span>
                </button>

                <AuthControls />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="mx-3 mb-0 mt-3 flex h-[var(--topbar-height)] shrink-0 items-center gap-3 rounded-[24px] border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.82)] px-4 backdrop-blur-xl">
          {showSidebar && !isMobile && (
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-xl p-1.5 text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]"
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 0 : 180 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <ChevronLeft size={18} />
              </motion.div>
            </button>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[rgb(var(--text-muted))]">
              {getPageLabel(pathname)}
            </p>
          </div>

          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--border))]"
          >
            <Command size={13} />
            <span>Ctrl + K</span>
          </button>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden px-3 pb-3 pt-3">{children}</main>
      </div>

      {isMobile && (
        <nav className="fixed bottom-3 left-3 right-3 z-50 flex h-16 items-center justify-around rounded-[24px] border border-[rgb(var(--border))] bg-[rgba(var(--surface),0.92)] px-2 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
                  active ? 'text-blue-600' : 'text-[rgb(var(--text-muted))]',
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav"
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500"
                  />
                )}
              </button>
            )
          })}
        </nav>
      )}

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <AnimatePresence>
        {healthOpen && <SystemHealthWidget onClose={() => setHealthOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

