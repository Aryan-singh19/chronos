'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ZoomIn, ZoomOut, Maximize2, Plus, Grid3x3, AlignLeft,
  LayoutList, Calendar, BarChart2, Eye, EyeOff,
} from 'lucide-react'
import { useTimelineStore, useAppStore } from '@/stores'
import { TimelineCanvas } from '@/components/canvas/TimelineCanvas'
import { InspectorPanel } from '@/components/panels/InspectorPanel'
import { TimelineToolbar } from '@/components/canvas/TimelineToolbar'
import { TimelineScrubber } from '@/components/canvas/TimelineScrubber'
import { MinimapWidget } from '@/components/canvas/MinimapWidget'
import { GanttView } from '@/components/canvas/GanttView'
import { KanbanView } from '@/components/canvas/KanbanView'
import { CalendarView } from '@/components/canvas/CalendarView'
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
  const { loadTimeline, viewMode, setViewMode, selection, setCanvasTransform, canvasTransform } = useTimelineStore()
  const { settings } = useAppStore()
  const [showInspector, setShowInspector] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const selectedNodeId = selection.selectedNodeIds.size === 1
    ? [...selection.selectedNodeIds][0]
    : null

  useEffect(() => {
    if (timelineId) {
      loadTimeline(timelineId).then(() => setIsLoaded(true))
    }
  }, [timelineId, loadTimeline])

  // Show inspector when a node is selected
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
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[rgb(var(--text-muted))]">Loading timeline…</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showSidebar={!isPresentationMode}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* View mode tabs + toolbar */}
        {!isPresentationMode && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] shrink-0">
            {/* View tabs */}
            <div className="flex items-center gap-0.5 bg-[rgb(var(--surface-2))] rounded-lg p-1">
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab.mode}
                  onClick={() => setViewMode(tab.mode)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
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

            {/* Zoom controls */}
            {viewMode === 'timeline' && (
              <div className="flex items-center gap-1 bg-[rgb(var(--surface-2))] rounded-lg p-1">
                <button onClick={() => handleZoom(-0.1)} className="p-1.5 rounded-md hover:bg-[rgb(var(--border))] transition-colors text-[rgb(var(--text-muted))]">
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-medium text-[rgb(var(--text-muted))] px-2 min-w-[40px] text-center">
                  {Math.round(canvasTransform.scale * 100)}%
                </span>
                <button onClick={() => handleZoom(0.1)} className="p-1.5 rounded-md hover:bg-[rgb(var(--border))] transition-colors text-[rgb(var(--text-muted))]">
                  <ZoomIn size={14} />
                </button>
                <button onClick={handleFitView} className="p-1.5 rounded-md hover:bg-[rgb(var(--border))] transition-colors text-[rgb(var(--text-muted))]">
                  <Maximize2 size={14} />
                </button>
              </div>
            )}

            {/* Presentation mode */}
            <button
              onClick={() => setIsPresentationMode(true)}
              className="p-2 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] transition-colors"
              title="Presentation Mode"
            >
              <Eye size={16} />
            </button>

            {/* Inspector toggle */}
            <button
              onClick={() => setShowInspector((o) => !o)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showInspector
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                  : 'hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]',
              )}
              title="Toggle Inspector"
            >
              <AlignLeft size={16} />
            </button>
          </div>
        )}

        {/* Presentation mode exit */}
        {isPresentationMode && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setIsPresentationMode(false)}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded-xl text-sm backdrop-blur-sm"
          >
            <EyeOff size={14} />
            Exit Presentation
          </motion.button>
        )}

        {/* Canvas area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            {viewMode === 'timeline' && <TimelineCanvas timelineId={timelineId} presentationMode={isPresentationMode} />}
            {viewMode === 'gantt' && <GanttView timelineId={timelineId} />}
            {viewMode === 'kanban' && <KanbanView timelineId={timelineId} />}
            {viewMode === 'calendar' && <CalendarView timelineId={timelineId} />}

            {/* Minimap */}
            {settings?.profile.showMinimap && viewMode === 'timeline' && (
              <MinimapWidget timelineId={timelineId} />
            )}
          </div>

          {/* Inspector Panel */}
          <AnimatePresence>
            {showInspector && !isPresentationMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="shrink-0 border-l border-[rgb(var(--border))] bg-[rgb(var(--surface))] overflow-hidden"
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

        {/* Scrubber */}
        {viewMode === 'timeline' && !isPresentationMode && (
          <TimelineScrubber timelineId={timelineId} />
        )}
      </div>
    </AppShell>
  )
}
