'use client'

import type { Lane, TimelineNode } from '@/types'

export function LaneTrack({ lane, nodes }: { lane: Lane; nodes: TimelineNode[] }) {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        top: lane.order * 160,
        height: 140,
        background: `${lane.color}08`,
        borderTop: `1px solid ${lane.color}30`,
        borderBottom: `1px solid ${lane.color}30`,
      }}
    >
      <span
        className="absolute left-2 top-2 text-xs font-semibold opacity-50"
        style={{ color: lane.color }}
      >
        {lane.name}
      </span>
    </div>
  )
}
