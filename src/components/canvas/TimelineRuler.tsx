'use client'
// TimelineRuler
import { useMemo } from 'react'
import { format } from 'date-fns'
import type { Timeline, TimelineNode, CanvasTransform } from '@/types'

interface TimelineRulerProps {
  timeline?: Timeline
  nodes: TimelineNode[]
  transform: CanvasTransform
}

export function TimelineRuler({ timeline, nodes, transform }: TimelineRulerProps) {
  const marks = useMemo(() => {
    if (!nodes.length) return []
    const sorted = [...nodes].sort((a, b) => a.date - b.date)
    const minDate = sorted[0].date
    const maxDate = sorted[sorted.length - 1].date + 1
    const range = maxDate - minDate || 86400000
    const step = Math.max(86400000, range / 20)
    const result = []
    for (let d = minDate; d <= maxDate + step; d += step) {
      const x = ((d - minDate) / range) * 2000 * transform.scale + transform.x + 100
      if (x < -100 || x > 4000) continue
      result.push({ x, label: format(new Date(d), timeline?.timeScale === 'year' ? 'yyyy' : timeline?.timeScale === 'month' ? 'MMM yyyy' : 'MMM d') })
    }
    return result
  }, [nodes, transform, timeline])

  return (
    <div className="timeline-ruler pointer-events-none z-10 w-full">
      {marks.map((mark, i) => (
        <div key={i} className="ruler-mark" style={{ left: mark.x }}>
          <span>{mark.label}</span>
          <div className="ruler-mark-line" style={{ height: 8 }} />
        </div>
      ))}
    </div>
  )
}
