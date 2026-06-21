'use client'

import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useTimelineStore } from '@/stores'
import { formatDate } from '@/lib/utils'
import type { ID } from '@/types'

export function TimelineScrubber({ timelineId }: { timelineId: ID }) {
  const { nodes, setCanvasTransform, canvasTransform } = useTimelineStore()
  const [jumpDate, setJumpDate] = useState('')

  const timelineNodes = useMemo(
    () =>
      Object.values(nodes)
        .filter((node) => node.timelineId === timelineId)
        .sort((left, right) => left.date - right.date),
    [nodes, timelineId],
  )

  const minDate = timelineNodes[0]?.date
  const maxDate = timelineNodes[timelineNodes.length - 1]?.date
  const currentProgress = useMemo(() => {
    if (!minDate || !maxDate) return 0
    const progress = ((200 - canvasTransform.x) / (2000 * canvasTransform.scale)) * 100
    return Math.max(0, Math.min(100, Math.round(progress)))
  }, [canvasTransform.scale, canvasTransform.x, maxDate, minDate])

  const jumpToProgress = (progress: number) => {
    setCanvasTransform({ x: -(progress / 100) * 2000 * canvasTransform.scale + 200 })
  }

  const handleJump = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJumpDate(event.target.value)
    if (!minDate || !maxDate) return
    const target = new Date(event.target.value).getTime()
    const range = maxDate - minDate || 1
    const progress = ((target - minDate) / range) * 100
    jumpToProgress(Math.max(0, Math.min(100, progress)))
  }

  const disabled = timelineNodes.length === 0

  return (
    <div className="timeline-scrubber gap-3">
      <span className="shrink-0 text-xs text-[rgb(var(--text-muted))]">
        {minDate ? formatDate(minDate, 'MMM yyyy') : 'No events yet'}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={currentProgress}
        disabled={disabled}
        onChange={(event) => jumpToProgress(Number(event.target.value))}
        className="h-1.5 flex-1 rounded-full accent-blue-500 disabled:opacity-40"
      />

      <span className="shrink-0 text-xs text-[rgb(var(--text-muted))]">
        {maxDate ? formatDate(maxDate, 'MMM yyyy') : '—'}
      </span>

      <span className="rounded-full bg-[rgb(var(--surface-2))] px-2.5 py-1 text-[11px] font-medium text-[rgb(var(--text-muted))]">
        {currentProgress}%
      </span>

      <input
        type="date"
        value={jumpDate}
        onChange={handleJump}
        disabled={disabled}
        className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-2 py-1 text-xs outline-none transition-colors focus:border-blue-400 disabled:opacity-40"
        title="Jump to date"
      />

      <button
        onClick={() => jumpToProgress(0)}
        disabled={disabled}
        className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-1.5 text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--text))] disabled:opacity-40"
        title="Reset timeline position"
      >
        <RotateCcw size={13} />
      </button>

      <span className="shrink-0 text-xs text-[rgb(var(--text-muted))]">
        {timelineNodes.length} event{timelineNodes.length === 1 ? '' : 's'}
      </span>
    </div>
  )
}
