import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

// ─── Class Names ──────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(timestamp: number, pattern = 'MMM d, yyyy'): string {
  return format(new Date(timestamp), pattern)
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

export function formatDateForScale(
  timestamp: number,
  scale: string,
): string {
  switch (scale) {
    case 'minute': return format(new Date(timestamp), 'HH:mm')
    case 'hour': return format(new Date(timestamp), 'HH:mm, MMM d')
    case 'day': return format(new Date(timestamp), 'MMM d')
    case 'week': return format(new Date(timestamp), "'W'w yyyy")
    case 'month': return format(new Date(timestamp), 'MMM yyyy')
    case 'year': return format(new Date(timestamp), 'yyyy')
    default: return format(new Date(timestamp), 'MMM d, yyyy')
  }
}

// ─── Color Utilities ──────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function lightenColor(hex: string, amount = 0.2): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * amount))
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * amount))
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

export const STATUS_COLORS = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  done: '#22c55e',
  archived: '#94a3b8',
}

export const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#22c55e', '#06b6d4', '#f97316', '#6366f1',
]

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function estimateStorageUsage(): Promise<{ used: number; quota: number }> {
  if (!navigator.storage?.estimate) return { used: 0, quota: 0 }
  const est = await navigator.storage.estimate()
  return {
    used: (est.usage ?? 0) / (1024 * 1024),
    quota: (est.quota ?? 0) / (1024 * 1024),
  }
}

// ─── File Utilities ───────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Canvas Math ──────────────────────────────────────────────────────────────

export function screenToCanvas(
  screenX: number,
  screenY: number,
  transform: { x: number; y: number; scale: number },
) {
  return {
    x: (screenX - transform.x) / transform.scale,
    y: (screenY - transform.y) / transform.scale,
  }
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  transform: { x: number; y: number; scale: number },
) {
  return {
    x: canvasX * transform.scale + transform.x,
    y: canvasY * transform.scale + transform.y,
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export { nanoid } from 'nanoid'

// ─── FPS Monitor ──────────────────────────────────────────────────────────────

export function createFPSMonitor(callback: (fps: number) => void) {
  let lastTime = performance.now()
  let frames = 0
  let rafId: number

  const tick = (now: number) => {
    frames++
    if (now - lastTime >= 1000) {
      callback(Math.round((frames * 1000) / (now - lastTime)))
      frames = 0
      lastTime = now
    }
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}
