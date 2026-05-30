'use client'

import { useMemo } from 'react'
import type { TimelineNode, Connection } from '@/types'

interface ConnectionLinesProps {
  nodes: TimelineNode[]
  connections: Connection[]
}

function getPath(from: { x: number; y: number }, to: { x: number; y: number }, style: string): string {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  if (style === 'curved') {
    return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`
  }
  if (style === 'orthogonal') {
    return `M ${from.x} ${from.y} L ${mx} ${from.y} L ${mx} ${to.y} L ${to.x} ${to.y}`
  }
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
}

export function ConnectionLines({ nodes, connections }: ConnectionLinesProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  if (!connections.length) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgb(var(--text-muted))" />
        </marker>
        <marker id="arrow-dep" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
        </marker>
      </defs>
      {connections.map((conn) => {
        const from = nodeMap.get(conn.fromNodeId)
        const to = nodeMap.get(conn.toNodeId)
        if (!from || !to) return null
        const fromPt = { x: from.x + 110, y: from.y + 24 }
        const toPt = { x: to.x, y: to.y + 24 }
        const path = getPath(fromPt, toPt, conn.style)
        const isDep = conn.type === 'dependency'
        return (
          <g key={conn.id}>
            <path
              d={path}
              className="connection-line"
              stroke={isDep ? '#ef4444' : 'rgb(var(--text-muted))'}
              strokeOpacity={0.5}
              strokeDasharray={isDep ? '5,3' : undefined}
              markerEnd={isDep ? 'url(#arrow-dep)' : 'url(#arrow)'}
            />
          </g>
        )
      })}
    </svg>
  )
}
