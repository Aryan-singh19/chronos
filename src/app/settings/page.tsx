'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HardDrive, Info, Keyboard, Palette, Shield, Sparkles, User } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/stores'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
] as const

const DEFAULT_SHORTCUTS = [
  { action: 'New Node', key: 'N' },
  { action: 'Delete Selected', key: 'Backspace' },
  { action: 'Undo', key: 'Ctrl+Z' },
  { action: 'Redo', key: 'Ctrl+Y' },
  { action: 'Command Palette', key: 'Ctrl+K' },
  { action: 'Select All', key: 'Ctrl+A' },
  { action: 'Save', key: 'Ctrl+S' },
  { action: 'Search', key: 'Ctrl+F' },
  { action: 'Zoom In', key: 'Ctrl++' },
  { action: 'Zoom Out', key: 'Ctrl+-' },
  { action: 'Fit View', key: 'Ctrl+0' },
  { action: 'Toggle Inspector', key: 'I' },
] as const

export default function SettingsPage() {
  const { settings, updateProfile } = useAppStore()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('profile')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const profile = settings?.profile

  useEffect(() => {
    if (saveState !== 'saved') return
    const timeout = window.setTimeout(() => setSaveState('idle'), 1800)
    return () => window.clearTimeout(timeout)
  }, [saveState])

  if (!profile) return null

  const persistProfile = async (data: Partial<typeof profile>) => {
    setSaveState('saving')
    await updateProfile(data)
    setSaveState('saved')
  }

  return (
    <AppShell>
      <div className="flex flex-1 overflow-hidden">
        <div className="surface-panel w-64 shrink-0 rounded-[28px] p-3">
          <div className="rounded-[24px] bg-slate-950 px-4 py-4 text-slate-50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              <Sparkles size={13} />
              Product settings
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Tune the local workspace experience without losing the premium SaaS feel.
            </p>
          </div>

          <p className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
            Settings
          </p>

          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mb-1 flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300'
                  : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="section-shell surface-panel mb-6 rounded-[32px] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Workspace settings</p>
                <h1 className="mt-1 text-3xl font-bold">Preferences and personalization</h1>
                <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-muted))]">
                  Refine the visual system, editing ergonomics, backup behavior, and local security posture
                  for your Chronos workspace.
                </p>
              </div>

              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  saveState === 'saved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : saveState === 'saving'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]'
                }`}
              >
                {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving...' : 'Auto-save enabled'}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {activeTab === 'profile' && (
                <div className="max-w-2xl space-y-6">
                  <div className="surface-panel rounded-[28px] p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-[22px] text-2xl font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                        style={{ background: profile.accentColor }}
                      >
                        {profile.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{profile.name}</p>
                        <p className="text-sm text-[rgb(var(--text-muted))]">Local workspace operator</p>
                      </div>
                    </div>
                  </div>

                  <div className="surface-panel rounded-[28px] p-6">
                    <label className="mb-2 block text-sm font-medium">Display Name</label>
                    <input
                      value={profile.name}
                      onChange={(event) => void persistProfile({ name: event.target.value })}
                      className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.92)] px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))]"
                    />
                    <p className="mt-3 text-xs text-[rgb(var(--text-muted))]">
                      This name appears in the workspace shell and recent activity areas.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="max-w-3xl space-y-6">
                  <div className="surface-panel rounded-[28px] p-6">
                    <label className="mb-3 block text-sm font-medium">Accent Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={profile.accentColor}
                        onChange={(event) => {
                          const hex = event.target.value
                          const red = Number.parseInt(hex.slice(1, 3), 16)
                          const green = Number.parseInt(hex.slice(3, 5), 16)
                          const blue = Number.parseInt(hex.slice(5, 7), 16)
                          document.documentElement.style.setProperty('--accent-hex', hex)
                          document.documentElement.style.setProperty('--accent', `${red} ${green} ${blue}`)
                          void persistProfile({ accentColor: hex })
                        }}
                        className="h-14 w-14 cursor-pointer rounded-2xl border border-[rgb(var(--border))]"
                      />
                      <div>
                        <p className="font-mono text-sm">{profile.accentColor}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">
                          Used across buttons, focus states, and product accents
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="surface-panel rounded-[28px] p-6">
                      <label className="mb-3 block text-sm font-medium">Card Density</label>
                      <div className="grid gap-2">
                        {(['minimal', 'medium', 'rich'] as const).map((density) => (
                          <button
                            key={density}
                            onClick={() => void persistProfile({ cardDensity: density })}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition-all ${
                              profile.cardDensity === density
                                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950'
                                : 'border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] text-[rgb(var(--text-muted))]'
                            }`}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="surface-panel rounded-[28px] p-6">
                      <label className="mb-3 block text-sm font-medium">Canvas Background</label>
                      <div className="grid gap-2">
                        {(['dots', 'grid', 'lines', 'blank'] as const).map((backgroundStyle) => (
                          <button
                            key={backgroundStyle}
                            onClick={() => void persistProfile({ backgroundStyle })}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition-all ${
                              profile.backgroundStyle === backgroundStyle
                                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950'
                                : 'border-[rgb(var(--border))] bg-[rgba(var(--surface-2),0.9)] text-[rgb(var(--text-muted))]'
                            }`}
                          >
                            {backgroundStyle}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {[
                    {
                      label: 'Show "Now" Marker',
                      detail: 'Display the current date indicator inside timeline views',
                      value: profile.showNowMarker,
                      onChange: () => void persistProfile({ showNowMarker: !profile.showNowMarker }),
                    },
                    {
                      label: 'Show Minimap',
                      detail: 'Keep a compact overview map available during timeline navigation',
                      value: profile.showMinimap,
                      onChange: () => void persistProfile({ showMinimap: !profile.showMinimap }),
                    },
                  ].map((item) => (
                    <div key={item.label} className="surface-panel flex items-center justify-between rounded-[28px] p-5">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{item.detail}</p>
                      </div>
                      <button
                        onClick={item.onChange}
                        className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? 'bg-blue-500' : 'bg-[rgb(var(--border))]'}`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            item.value ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="max-w-2xl space-y-4">
                  <div className="surface-panel rounded-[28px] p-6">
                    <h2 className="text-xl font-bold">Keyboard shortcuts</h2>
                    <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                      These shortcuts keep creation and navigation fast while preserving the product’s local-first editing feel.
                    </p>
                  </div>
                  <div className="surface-panel rounded-[28px] p-4">
                    {DEFAULT_SHORTCUTS.map((shortcut) => (
                      <div
                        key={shortcut.action}
                        className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors hover:bg-[rgb(var(--surface-2))]"
                      >
                        <span className="text-sm">{shortcut.action}</span>
                        <kbd className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-2.5 py-1 font-mono text-xs">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="max-w-2xl space-y-6">
                  <div className="surface-panel rounded-[28px] p-6">
                    <h2 className="text-xl font-bold">Storage & backup</h2>
                    <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                      Keep the local workspace resilient with sensible auto-save and backup pacing.
                    </p>
                  </div>

                  <div className="surface-panel rounded-[28px] p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save Interval</span>
                      <select
                        value={profile.autoSaveInterval}
                        onChange={(event) => void persistProfile({ autoSaveInterval: Number(event.target.value) })}
                        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none"
                      >
                        <option value={10}>Every 10s</option>
                        <option value={30}>Every 30s</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="surface-panel rounded-[28px] p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Backup Schedule</span>
                      <select
                        value={profile.backupSchedule}
                        onChange={(event) => void persistProfile({ backupSchedule: event.target.value as typeof profile.backupSchedule })}
                        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm outline-none"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="manual">Manual only</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="max-w-2xl space-y-6">
                  <div className="surface-panel rounded-[28px] p-6">
                    <h2 className="text-xl font-bold">Security</h2>
                    <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                      Chronos stays local-first, but you can still tighten protection for the machine it runs on.
                    </p>
                  </div>

                  <div className="surface-panel flex items-center justify-between rounded-[28px] p-5">
                    <div>
                      <p className="text-sm font-medium">Encrypt Local Data</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">
                        Password-protect your local timeline database and backups
                      </p>
                    </div>
                    <button
                      onClick={() => void persistProfile({ enableEncryption: !profile.enableEncryption })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${profile.enableEncryption ? 'bg-blue-500' : 'bg-[rgb(var(--border))]'}`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          profile.enableEncryption ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="max-w-2xl space-y-6">
                  <div className="rounded-[28px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-600 text-2xl">
                      ⏱
                    </div>
                    <h2 className="text-2xl font-bold">Chronos Cloud</h2>
                    <p className="mt-2 text-sm text-slate-300">Timeline intelligence for teams that ship.</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Version 1.0.0 · Local-first core · SaaS-ready shell
                    </p>
                  </div>

                  <div className="surface-panel rounded-[28px] p-6">
                    <div className="space-y-2 text-sm text-[rgb(var(--text-muted))]">
                      <p>✓ Local-first workspace with export-friendly architecture</p>
                      <p>✓ Auth, memberships, billing, and production routing now integrated</p>
                      <p>✓ Progressive Web App support and offline-friendly foundations</p>
                      <p>✓ Designed to feel launch-ready without losing product velocity</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}
