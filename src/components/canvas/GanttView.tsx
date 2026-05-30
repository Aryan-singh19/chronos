'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { useTimelineStore } from '@/stores'
import { formatDate, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils'
import type { ID, NodeStatus } from '@/types'

// ─── Gantt View ───────────────────────────────────────────────────────────────

export function GanttView({ timelineId }: { timelineId: ID }) {
  const { nodes } = useTimelineStore()
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId).sort((a, b) => a.date - b.date),
    [nodes, timelineId],
  )

  const minDate = timelineNodes[0]?.date ?? Date.now()
  const maxDate = timelineNodes[timelineNodes.length - 1]?.date ?? Date.now() + 86400000 * 30
  const range = maxDate - minDate || 86400000 * 30

  if (!timelineNodes.length) return <EmptyView label="No events to show in Gantt view" />

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="min-w-[800px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-48 shrink-0" />
          <div className="flex-1 relative h-6">
            {[0, 0.25, 0.5, 0.75, 1].map((pos) => (
              <span
                key={pos}
                className="absolute text-xs text-[rgb(var(--text-muted))] -translate-x-1/2"
                style={{ left: `${pos * 100}%` }}
              >
                {format(new Date(minDate + range * pos), 'MMM d')}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {timelineNodes.map((node, i) => {
            const start = ((node.date - minDate) / range) * 100
            const end = node.endDate ? ((node.endDate - minDate) / range) * 100 : start + 3
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2"
              >
                <div className="w-48 shrink-0 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[node.priority] }} />
                  <span className="text-xs font-medium truncate">{node.title}</span>
                </div>
                <div className="flex-1 relative h-8 bg-[rgb(var(--surface-2))] rounded-lg overflow-hidden">
                  <div
                    className="absolute top-1 bottom-1 rounded-md flex items-center px-2"
                    style={{
                      left: `${Math.max(0, start)}%`,
                      width: `${Math.max(3, end - start)}%`,
                      background: node.color,
                      opacity: 0.85,
                    }}
                  >
                    <span className="text-white text-[10px] font-medium truncate">{node.title}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Kanban View ──────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: { status: NodeStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: '#64748b' },
  { status: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { status: 'done', label: 'Done', color: '#22c55e' },
  { status: 'archived', label: 'Archived', color: '#94a3b8' },
]

export function KanbanView({ timelineId }: { timelineId: ID }) {
  const { nodes, updateNode } = useTimelineStore()
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId),
    [nodes, timelineId],
  )

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {KANBAN_COLUMNS.map((col) => {
          const colNodes = timelineNodes.filter((n) => n.status === col.status)
          return (
            <div key={col.status} className="w-72 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                </div>
                <span className="text-xs text-[rgb(var(--text-muted))] bg-[rgb(var(--surface-2))] px-2 py-0.5 rounded-full">
                  {colNodes.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                {colNodes.map((node, i) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl p-3 cursor-pointer hover:shadow-card-hover transition-all"
                    style={{ borderLeft: `3px solid ${node.color}` }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-sm font-medium leading-snug flex-1 mr-2">{node.title}</p>
                      <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: PRIORITY_COLORS[node.priority] }} />
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">{formatDate(node.date)}</p>
                    {node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {node.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Calendar View ────────────────────────────────────────────────────────────

export function CalendarView({ timelineId }: { timelineId: ID }) {
  const { nodes } = useTimelineStore()
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId),
    [nodes, timelineId],
  )
  const now = new Date()
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex-1 overflow-auto p-6">
      <h2 className="text-lg font-bold mb-4">{format(now, 'MMMM yyyy')}</h2>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-[rgb(var(--text-muted))] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {[...Array(days[0].getDay())].map((_, i) => <div key={`empty-${i}`} />)}
        {days.map((day) => {
          const dayNodes = timelineNodes.filter((n) => isSameDay(new Date(n.date), day))
          const isToday = isSameDay(day, now)
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] rounded-xl p-1.5 border text-xs transition-colors ${
                isToday
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))]'
              }`}
            >
              <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-[rgb(var(--text-muted))]'}`}>
                {format(day, 'd')}
              </span>
              {dayNodes.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  className="mt-1 text-[10px] px-1.5 py-0.5 rounded truncate text-white"
                  style={{ background: n.color }}
                >
                  {n.title}
                </div>
              ))}
              {dayNodes.length > 2 && (
                <span className="text-[9px] text-[rgb(var(--text-muted))] mt-0.5 block">+{dayNodes.length - 2} more</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyView({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm text-[rgb(var(--text-muted))]">{label}</p>
    </div>
  )
}
