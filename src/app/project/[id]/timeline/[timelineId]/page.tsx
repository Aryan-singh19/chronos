'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  AlignLeft,
  LayoutList,
  Calendar,
  BarChart2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useTimelineStore, useAppStore } from '@/stores'
import { TimelineCanvas } from '@/components/canvas/TimelineCanvas'
import { InspectorPanel } from '@/components/panels/InspectorPanel'
import { TimelineToolbar } from '@/components/canvas/TimelineToolbar'
import { TimelineScrubber } from '@/components/canvas/TimelineScrubber'
import { MinimapWidget } from '@/components/canvas/MinimapWidget'
import { GanttView, KanbanView, CalendarView } from '@/components/canvas/GanttView'
import { AppShell } from '@/components/layout/AppShell'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/types'

const VIEW_TABS: { mode: ViewMode; icon: typeof Grid3x3; label: string }[] = [
  { mode: 'timeline', icon: AlignLeft, label: 'Timeline' },
  { mode: 'gantt', icon: BarChart2, label: 'Gantt' },
  { mode: 'kanban', icon: LayoutList, label: 'Kanban' },
  { mode: 'calendar', icon: Calendar, label: 'Calendar' },
]

export default function TimelinePage() {
  const { id, timelineId } = useParams<{ id: string; timelineId: string }>()
  const {
    loadTimeline,
    viewMode,
    setViewMode,
    selection,
    setCanvasTransform,
    canvasTransform,
    timelines,
  } = useTimelineStore()
  const { settings, addRecentItem } = useAppStore()
  const [showInspector, setShowInspector] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const selectedNodeId =
    selection.selectedNodeIds.size === 1 ? [...selection.selectedNodeIds][0] : null
  const selectedCount = selection.selectedNodeIds.size
  const timeline = timelines[timelineId]

  useEffect(() => {
    if (timelineId) {
      loadTimeline(timelineId).then(() => setIsLoaded(true))
    }
  }, [timelineId, loadTimeline])

  useEffect(() => {
    if (!timeline) return
    void addRecentItem({
      id: timeline.id,
      type: 'timeline',
      title: timeline.name,
      projectId: id,
      timelineId: timeline.id,
    })
  }, [addRecentItem, id, timeline])

  useEffect(() => {
    if (selectedNodeId) setShowInspector(true)
  }, [selectedNodeId])

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.1, Math.min(4, canvasTransform.scale + delta))
    setCanvasTransform({ scale: newScale })
  }

  const handleFitView = () => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 })
  }

  if (!isLoaded) {
    return (
      <AppShell showSidebar={false}>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-[rgb(var(--text-muted))]">Loading timeline…</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showSidebar={!isPresentationMode}>
      <div className="flex h-full flex-col overflow-hidden">
        {!isPresentationMode && (
          <div className="shrink-0 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex items-center gap-0.5 rounded-lg bg-[rgb(var(--surface-2))] p-1">
                {VIEW_TABS.map((tab) => (
                  <button
                    key={tab.mode}
                    onClick={() => setViewMode(tab.mode)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      viewMode === tab.mode
                        ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm'
                        : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]',
                    )}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-[rgb(var(--border))]" />

              <TimelineToolbar timelineId={timelineId} />

              <div className="flex-1" />

              <div className="hidden items-center gap-2 rounded-full bg-[rgb(var(--surface-2))] px-3 py-1 text-[11px] font-medium text-[rgb(var(--text-muted))] lg:flex">
                <span>{timeline?.name ?? 'Timeline'}</span>
                <span>•</span>
                <span>
                  {selectedCount > 0
                    ? `${selectedCount} selected`
                    : viewMode === 'timeline'
                      ? 'Double-click to add an event'
                      : `Viewing ${viewMode}`}
                </span>
              </div>

              {viewMode === 'timeline' && (
                <div className="flex items-center gap-1 rounded-lg bg-[rgb(var(--surface-2))] p-1">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="rounded-md p-1.5 text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--border))]"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="min-w-[40px] px-2 text-center text-xs font-medium text-[rgb(var(--text-muted))]">
                    {Math.round(canvasTransform.scale * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="rounded-md p-1.5 text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--border))]"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={handleFitView}
                    className="rounded-md p-1.5 text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--border))]"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsPresentationMode(true)}
                className="rounded-lg p-2 text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--surface-2))]"
                title="Presentation mode"
              >
                <Eye size={16} />
              </button>

              <button
                onClick={() => setShowInspector((open) => !open)}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  showInspector
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                    : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]',
                )}
                title="Toggle inspector"
              >
                <AlignLeft size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 pb-2 text-[11px] text-[rgb(var(--text-muted))]">
              <span>
                {viewMode === 'timeline'
                  ? 'Use the canvas for structure, then refine selected events in the inspector.'
                  : 'Switch views to pressure-test the same timeline from different angles.'}
              </span>
              <span className="hidden md:block">
                {selectedCount > 0
                  ? 'Tip: Shift-click to multi-select more events.'
                  : 'Tip: Right-click any event for quick actions.'}
              </span>
            </div>
          </div>
        )}

        {isPresentationMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsPresentationMode(false)}
            className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm"
          >
            <EyeOff size={14} />
            Exit presentation
          </motion.button>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-hidden">
            {viewMode === 'timeline' && (
              <TimelineCanvas timelineId={timelineId} presentationMode={isPresentationMode} />
            )}
            {viewMode === 'gantt' && <GanttView timelineId={timelineId} />}
            {viewMode === 'kanban' && <KanbanView timelineId={timelineId} />}
            {viewMode === 'calendar' && <CalendarView timelineId={timelineId} />}

            {settings?.profile.showMinimap && viewMode === 'timeline' && (
              <MinimapWidget timelineId={timelineId} />
            )}
          </div>

          <AnimatePresence>
            {showInspector && !isPresentationMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="shrink-0 overflow-hidden border-l border-[rgb(var(--border))] bg-[rgb(var(--surface))]"
              >
                <InspectorPanel
                  nodeId={selectedNodeId}
                  timelineId={timelineId}
                  onClose={() => setShowInspector(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {viewMode === 'timeline' && !isPresentationMode && (
          <TimelineScrubber timelineId={timelineId} />
        )}
      </div>
    </AppShell>
  )
}
