'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Palette, Keyboard, HardDrive, Bell, Shield, Info, ChevronRight,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/stores'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
]

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
]

export default function SettingsPage() {
  const { settings, updateProfile } = useAppStore()
  const [activeTab, setActiveTab] = useState('profile')
  const profile = settings?.profile

  if (!profile) return null

  return (
    <AppShell>
      <div className="flex flex-1 overflow-hidden">
        {/* Settings sidebar */}
        <div className="w-56 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-3">
          <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider px-3 py-2">Settings</p>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-2))]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'profile' && (
                <div className="max-w-lg space-y-6">
                  <h2 className="text-xl font-bold">Profile</h2>
                  <div className="flex items-center gap-4 p-4 bg-[rgb(var(--surface-2))] rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: profile.accentColor }}>
                      {profile.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-sm text-[rgb(var(--text-muted))]">Local user</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5">Display Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="max-w-lg space-y-6">
                  <h2 className="text-xl font-bold">Appearance</h2>

                  <div>
                    <label className="text-sm font-medium block mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={profile.accentColor}
                        onChange={(e) => {
                          updateProfile({ accentColor: e.target.value })
                          document.documentElement.style.setProperty('--accent-hex', e.target.value)
                          const hex = e.target.value
                          const r = parseInt(hex.slice(1,3),16)
                          const g = parseInt(hex.slice(3,5),16)
                          const b = parseInt(hex.slice(5,7),16)
                          document.documentElement.style.setProperty('--accent', `${r} ${g} ${b}`)
                        }}
                        className="w-12 h-12 rounded-xl cursor-pointer border border-[rgb(var(--border))]"
                      />
                      <div>
                        <p className="font-mono text-sm">{profile.accentColor}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">Click to change accent color</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Card Density</label>
                    <div className="flex gap-2">
                      {(['minimal', 'medium', 'rich'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => updateProfile({ cardDensity: d })}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                            profile.cardDensity === d
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                              : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Canvas Background</label>
                    <div className="flex gap-2">
                      {(['dots', 'grid', 'lines', 'blank'] as const).map((bg) => (
                        <button
                          key={bg}
                          onClick={() => updateProfile({ backgroundStyle: bg })}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                            profile.backgroundStyle === bg
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                              : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--surface-2))] rounded-xl">
                    <div>
                      <p className="text-sm font-medium">Show &quot;Now&quot; Marker</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Display current date indicator on timeline</p>
                    </div>
                    <button
                      onClick={() => updateProfile({ showNowMarker: !profile.showNowMarker })}
                      className={`w-11 h-6 rounded-full transition-colors relative ${profile.showNowMarker ? 'bg-blue-500' : 'bg-[rgb(var(--border))]'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.showNowMarker ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--surface-2))] rounded-xl">
                    <div>
                      <p className="text-sm font-medium">Show Minimap</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Display overview map in timeline view</p>
                    </div>
                    <button
                      onClick={() => updateProfile({ showMinimap: !profile.showMinimap })}
                      className={`w-11 h-6 rounded-full transition-colors relative ${profile.showMinimap ? 'bg-blue-500' : 'bg-[rgb(var(--border))]'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.showMinimap ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="max-w-lg">
                  <h2 className="text-xl font-bold mb-6">Keyboard Shortcuts</h2>
                  <div className="space-y-1">
                    {DEFAULT_SHORTCUTS.map((s) => (
                      <div key={s.action} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[rgb(var(--surface-2))] transition-colors">
                        <span className="text-sm">{s.action}</span>
                        <kbd className="text-xs bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] px-2.5 py-1 rounded-lg font-mono">{s.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="max-w-lg space-y-6">
                  <h2 className="text-xl font-bold">Storage & Backup</h2>
                  <div className="p-4 bg-[rgb(var(--surface-2))] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save Interval</span>
                      <select
                        value={profile.autoSaveInterval}
                        onChange={(e) => updateProfile({ autoSaveInterval: Number(e.target.value) })}
                        className="text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg px-3 py-1.5 outline-none"
                      >
                        <option value={10}>Every 10s</option>
                        <option value={30}>Every 30s</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Backup Schedule</span>
                      <select
                        value={profile.backupSchedule}
                        onChange={(e) => updateProfile({ backupSchedule: e.target.value as any })}
                        className="text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg px-3 py-1.5 outline-none"
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
                <div className="max-w-lg space-y-6">
                  <h2 className="text-xl font-bold">Security</h2>
                  <div className="flex items-center justify-between p-4 bg-[rgb(var(--surface-2))] rounded-xl">
                    <div>
                      <p className="text-sm font-medium">Encrypt Local Data</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">Password-protect your timeline database</p>
                    </div>
                    <button
                      onClick={() => updateProfile({ enableEncryption: !profile.enableEncryption })}
                      className={`w-11 h-6 rounded-full transition-colors relative ${profile.enableEncryption ? 'bg-blue-500' : 'bg-[rgb(var(--border))]'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.enableEncryption ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="max-w-lg space-y-4">
                  <h2 className="text-xl font-bold">About Chronos</h2>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">⏱</span>
                    </div>
                    <h3 className="font-bold text-lg">Chronos</h3>
                    <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Map the past. Build the future.</p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-2">Version 1.0.0 · Local-First · Zero Cost</p>
                  </div>
                  <div className="space-y-2 text-sm text-[rgb(var(--text-muted))]">
                    <p>✓ 100% local — your data never leaves your device</p>
                    <p>✓ Open source under MIT License</p>
                    <p>✓ Works offline as a Progressive Web App</p>
                    <p>✓ Zero subscription, zero cloud fees</p>
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
