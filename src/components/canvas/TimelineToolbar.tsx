'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Undo2, Redo2, Download, Upload, GitBranch,
  Search, SlidersHorizontal, Layers,
} from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useTimelineStore } from '@/stores'
import { downloadJSON, downloadCSV, exportAsHTML, exportAsPDF } from '@/lib/export'
import type { ID } from '@/types'

export function TimelineToolbar({ timelineId }: { timelineId: ID }) {
  const { nodes, timelines, undo, redo, undoStack, redoStack, createNode, canvasTransform } = useTimelineStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const timeline = timelines[timelineId]
  const timelineNodes = Object.values(nodes).filter((n) => n.timelineId === timelineId)

  const handleExport = async (format: string) => {
    const filename = timeline?.name ?? 'chronos-export'
    if (format === 'json') downloadJSON({ timeline, nodes: timelineNodes }, `${filename}.json`)
    if (format === 'csv') downloadCSV(timelineNodes, `${filename}.csv`)
    if (format === 'html') {
      const html = exportAsHTML(timeline!, timelineNodes)
      const blob = new Blob([html], { type: 'text/html' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.html`; a.click()
    }
    if (format === 'pdf' && timeline) await exportAsPDF(timeline, timelineNodes, `${filename}.pdf`)
    setExportOpen(false)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Add node */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => createNode({ x: 200 - canvasTransform.x / canvasTransform.scale, y: 200, date: Date.now() })}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'rgb(var(--accent))' }}
      >
        <Plus size={13} />
        Add Event
      </motion.button>

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!undoStack.length}
        className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] disabled:opacity-30 transition-all"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={redo}
        disabled={!redoStack.length}
        className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] disabled:opacity-30 transition-all"
        title="Redo"
      >
        <Redo2 size={14} />
      </button>

      {/* Export */}
      <Popover.Root open={exportOpen} onOpenChange={setExportOpen}>
        <Popover.Trigger asChild>
          <button className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] transition-all" title="Export">
            <Download size={14} />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="z-50 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl shadow-xl p-2 min-w-[160px]"
          sideOffset={8}
        >
          {['json', 'csv', 'pdf', 'html'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[rgb(var(--surface-2))] text-sm uppercase font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors"
            >
              Export as {fmt.toUpperCase()}
            </button>
          ))}
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}
