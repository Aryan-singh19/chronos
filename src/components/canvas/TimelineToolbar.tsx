'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Undo2, Redo2, Download, CheckCircle2 } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useTimelineStore } from '@/stores'
import { downloadJSON, downloadCSV, exportAsHTML, exportAsPDF } from '@/lib/export'
import type { ID } from '@/types'

export function TimelineToolbar({ timelineId }: { timelineId: ID }) {
  const {
    nodes,
    timelines,
    undo,
    redo,
    undoStack,
    redoStack,
    createNode,
    selectNode,
    canvasTransform,
    selection,
  } = useTimelineStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const timeline = timelines[timelineId]
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((node) => node.timelineId === timelineId),
    [nodes, timelineId],
  )
  const selectedCount = selection.selectedNodeIds.size

  useEffect(() => {
    if (!statusMessage) return
    const timeout = window.setTimeout(() => setStatusMessage(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const handleAddEvent = async () => {
    const createdNode = await createNode({
      x: 200 - canvasTransform.x / canvasTransform.scale,
      y: 200,
      date: Date.now(),
    })
    selectNode(createdNode.id)
    setStatusMessage('New event added')
  }

  const handleExport = async (format: string) => {
    const filename = timeline?.name ?? 'chronos-export'
    if (format === 'json') downloadJSON({ timeline, nodes: timelineNodes }, `${filename}.json`)
    if (format === 'csv') downloadCSV(timelineNodes, `${filename}.csv`)
    if (format === 'html' && timeline) {
      const html = exportAsHTML(timeline, timelineNodes)
      const blob = new Blob([html], { type: 'text/html' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.html`
      link.click()
    }
    if (format === 'pdf' && timeline) await exportAsPDF(timeline, timelineNodes, `${filename}.pdf`)
    setExportOpen(false)
    setStatusMessage(`Exported as ${format.toUpperCase()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => void handleAddEvent()}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'rgb(var(--accent))' }}
      >
        <Plus size={13} />
        Add event
      </motion.button>

      <button
        onClick={undo}
        disabled={!undoStack.length}
        className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))] disabled:opacity-30"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={redo}
        disabled={!redoStack.length}
        className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))] disabled:opacity-30"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={14} />
      </button>

      <Popover.Root open={exportOpen} onOpenChange={setExportOpen}>
        <Popover.Trigger asChild>
          <button
            className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] transition-all hover:bg-[rgb(var(--surface-2))]"
            title="Export"
          >
            <Download size={14} />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="z-50 min-w-[160px] rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-2 shadow-xl"
          sideOffset={8}
        >
          {['json', 'csv', 'pdf', 'html'].map((format) => (
            <button
              key={format}
              onClick={() => void handleExport(format)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium uppercase text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]"
            >
              Export as {format.toUpperCase()}
            </button>
          ))}
        </Popover.Content>
      </Popover.Root>

      <AnimatePresence mode="wait">
        {statusMessage ? (
          <motion.div
            key={statusMessage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700"
          >
            <CheckCircle2 size={12} />
            {statusMessage}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1 text-[11px] font-medium text-[rgb(var(--text-muted))]"
          >
            {selectedCount > 0
              ? `${selectedCount} selected`
              : `${timelineNodes.length} event${timelineNodes.length === 1 ? '' : 's'}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
