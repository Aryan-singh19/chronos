'use client'

import { useMemo } from 'react'
import { useTimelineStore } from '@/stores'
import type { ID } from '@/types'

export function MinimapWidget({ timelineId }: { timelineId: ID }) {
  const { nodes, canvasTransform, setCanvasTransform } = useTimelineStore()
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId),
    [nodes, timelineId],
  )

  if (!timelineNodes.length) return null

  const minX = Math.min(...timelineNodes.map((n) => n.x))
  const maxX = Math.max(...timelineNodes.map((n) => n.x + 240))
  const minY = Math.min(...timelineNodes.map((n) => n.y))
  const maxY = Math.max(...timelineNodes.map((n) => n.y + 80))
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  return (
    <div className="minimap">
      <svg width="100%" height="100%" viewBox="0 0 160 100">
        {timelineNodes.map((n) => (
          <rect
            key={n.id}
            x={((n.x - minX) / rangeX) * 150 + 5}
            y={((n.y - minY) / rangeY) * 90 + 5}
            width={8}
            height={5}
            rx={1}
            fill={n.color}
            opacity={0.7}
          />
        ))}
      </svg>
    </div>
  )
}
