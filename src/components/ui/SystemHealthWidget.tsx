'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Cpu, Database, Zap, HardDrive } from 'lucide-react'
import { useAppStore } from '@/stores'
import { estimateStorageUsage, createFPSMonitor } from '@/lib/utils'

interface SystemHealthWidgetProps { onClose: () => void }

export function SystemHealthWidget({ onClose }: SystemHealthWidgetProps) {
  const { systemHealth, updateSystemHealth } = useAppStore()

  useEffect(() => {
    // FPS monitor
    const stopFPS = createFPSMonitor((fps) => updateSystemHealth({ fps }))

    // Memory + storage polling
    const poll = async () => {
      const { used, quota } = await estimateStorageUsage()
      const mem = (performance as any).memory
      updateSystemHealth({
        dbSizeMB: parseFloat(used.toFixed(1)),
        memoryUsedMB: mem ? parseFloat((mem.usedJSHeapSize / 1024 / 1024).toFixed(1)) : 0,
        memoryLimitMB: mem ? parseFloat((mem.jsHeapSizeLimit / 1024 / 1024).toFixed(1)) : 0,
        isHealthy: used < 500 && (mem ? mem.usedJSHeapSize / mem.jsHeapSizeLimit < 0.8 : true),
      })
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => { stopFPS(); clearInterval(interval) }
  }, [updateSystemHealth])

  const metrics = [
    { icon: Zap, label: 'FPS', value: `${systemHealth.fps}`, good: systemHealth.fps >= 55 },
    { icon: Cpu, label: 'Memory', value: `${systemHealth.memoryUsedMB} MB`, good: systemHealth.memoryUsedMB < 300 },
    { icon: Database, label: 'Storage', value: `${systemHealth.dbSizeMB} MB`, good: systemHealth.dbSizeMB < 200 },
    { icon: HardDrive, label: 'Cache', value: `${systemHealth.cacheHitRate}%`, good: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed bottom-16 left-4 z-50 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-4 shadow-xl w-56"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">System Health</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-2.5">
            <m.icon size={14} className="text-[rgb(var(--text-muted))]" />
            <span className="text-xs text-[rgb(var(--text-muted))] flex-1">{m.label}</span>
            <span className={`text-xs font-semibold ${m.good ? 'text-emerald-500' : 'text-amber-500'}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
      <div className={`mt-3 pt-3 border-t border-[rgb(var(--border))] flex items-center gap-1.5`}>
        <div className={`w-2 h-2 rounded-full ${systemHealth.isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="text-xs text-[rgb(var(--text-muted))]">
          {systemHealth.isHealthy ? 'All systems normal' : 'Performance degraded'}
        </span>
      </div>
    </motion.div>
  )
}
