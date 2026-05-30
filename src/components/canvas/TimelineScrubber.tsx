'use client'

import { useMemo, useState } from 'react'
import { useTimelineStore } from '@/stores'
import { formatDate } from '@/lib/utils'
import type { ID } from '@/types'

export function TimelineScrubber({ timelineId }: { timelineId: ID }) {
  const { nodes, setCanvasTransform, canvasTransform } = useTimelineStore()
  const [jumpDate, setJumpDate] = useState('')

  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId).sort((a, b) => a.date - b.date),
    [nodes, timelineId],
  )

  const minDate = timelineNodes[0]?.date
  const maxDate = timelineNodes[timelineNodes.length - 1]?.date

  const handleJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJumpDate(e.target.value)
    if (!minDate || !maxDate) return
    const target = new Date(e.target.value).getTime()
    const range = maxDate - minDate || 1
    const progress = (target - minDate) / range
    setCanvasTransform({ x: -progress * 2000 * canvasTransform.scale + 200 })
  }

  return (
    <div className="timeline-scrubber">
      <span className="text-xs text-[rgb(var(--text-muted))] shrink-0">
        {minDate ? formatDate(minDate, 'MMM yyyy') : '–'}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={0}
        onChange={(e) => {
          if (!minDate || !maxDate) return
          const progress = Number(e.target.value) / 100
          setCanvasTransform({ x: -progress * 2000 * canvasTransform.scale + 200 })
        }}
        className="flex-1 h-1.5 rounded-full accent-blue-500"
      />
      <span className="text-xs text-[rgb(var(--text-muted))] shrink-0">
        {maxDate ? formatDate(maxDate, 'MMM yyyy') : '–'}
      </span>
      <input
        type="date"
        value={jumpDate}
        onChange={handleJump}
        className="text-xs bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-lg px-2 py-1 outline-none focus:border-blue-400 transition-colors"
        title="Jump to date"
      />
      <span className="text-xs text-[rgb(var(--text-muted))] shrink-0">
        {timelineNodes.length} events
      </span>
    </div>
  )
}
