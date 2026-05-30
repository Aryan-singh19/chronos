'use client'

import {
  useRef, useCallback, useEffect, useState, useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTimelineStore, useAppStore } from '@/stores'
import { NodeCard } from '@/components/nodes/NodeCard'
import { ConnectionLines } from '@/components/canvas/ConnectionLines'
import { TimelineRuler } from '@/components/canvas/TimelineRuler'
import { LaneTrack } from '@/components/canvas/LaneTrack'
import { screenToCanvas, cn } from '@/lib/utils'
import type { ID } from '@/types'

interface TimelineCanvasProps {
  timelineId: ID
  presentationMode?: boolean
}

const MIN_SCALE = 0.1
const MAX_SCALE = 4
const SCALE_STEP = 0.001

export function TimelineCanvas({ timelineId, presentationMode }: TimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    nodes, connections, timelines, selection,
    canvasTransform, setCanvasTransform,
    createNode, selectNode, clearSelection, moveNode, commitNodeMove,
  } = useTimelineStore()
  const { settings } = useAppStore()

  const timeline = timelines[timelineId]
  const timelineNodes = useMemo(
    () => Object.values(nodes).filter((n) => n.timelineId === timelineId),
    [nodes, timelineId],
  )
  const timelineConnections = useMemo(
    () => Object.values(connections).filter((c) =>
      timelineNodes.some((n) => n.id === c.fromNodeId || n.id === c.toNodeId)),
    [connections, timelineNodes],
  )

  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [dragNodeId, setDragNodeId] = useState<ID | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [lassoStart, setLassoStart] = useState<{ x: number; y: number } | null>(null)
  const [lassoEnd, setLassoEnd] = useState<{ x: number; y: number } | null>(null)
  const [showFAB, setShowFAB] = useState(true)

  const bgClass = {
    dots: 'canvas-bg-dots',
    grid: 'canvas-bg-grid',
    lines: 'canvas-bg-lines',
    blank: 'canvas-bg-blank',
  }[settings?.profile.backgroundStyle ?? 'dots']

  // ── Zoom with scroll wheel ──────────────────────────────────────────────────

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const { scale, x, y } = canvasTransform
    const delta = -e.deltaY * SCALE_STEP * 3
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta * scale))
    const rect = containerRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const newX = mouseX - (mouseX - x) * (newScale / scale)
    const newY = mouseY - (mouseY - y) * (newScale / scale)
    setCanvasTransform({ scale: newScale, x: newX, y: newY })
  }, [canvasTransform, setCanvasTransform])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Pointer events ──────────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.target !== containerRef.current && !(e.target as Element).classList.contains('canvas-surface')) return
    if (e.button === 1 || e.button === 0) {
      e.preventDefault()
      clearSelection()
      if (e.shiftKey) {
        // Start lasso
        const rect = containerRef.current!.getBoundingClientRect()
        const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, canvasTransform)
        setLassoStart(pos)
        setLassoEnd(pos)
      } else {
        // Start pan
        setIsPanning(true)
        setPanStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y })
      }
    }
  }, [clearSelection, canvasTransform])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setCanvasTransform({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
    if (dragNodeId) {
      const rect = containerRef.current!.getBoundingClientRect()
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, canvasTransform)
      const snapSize = 24
      const x = settings?.profile ? Math.round((pos.x - dragOffset.x) / snapSize) * snapSize : pos.x - dragOffset.x
      const y = settings?.profile ? Math.round((pos.y - dragOffset.y) / snapSize) * snapSize : pos.y - dragOffset.y
      moveNode(dragNodeId, x, y)
    }
    if (lassoStart) {
      const rect = containerRef.current!.getBoundingClientRect()
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, canvasTransform)
      setLassoEnd(pos)
    }
  }, [isPanning, panStart, dragNodeId, dragOffset, canvasTransform, lassoStart, moveNode, setCanvasTransform])

  const handlePointerUp = useCallback(async () => {
    setIsPanning(false)
    if (dragNodeId) {
      await commitNodeMove(dragNodeId)
      setDragNodeId(null)
    }
    if (lassoStart && lassoEnd) {
      // Select nodes within lasso
      const minX = Math.min(lassoStart.x, lassoEnd.x)
      const maxX = Math.max(lassoStart.x, lassoEnd.x)
      const minY = Math.min(lassoStart.y, lassoEnd.y)
      const maxY = Math.max(lassoStart.y, lassoEnd.y)
      const inLasso = timelineNodes
        .filter((n) => n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY)
        .map((n) => n.id)
      if (inLasso.length) useTimelineStore.getState().selectNodes(inLasso)
      setLassoStart(null)
      setLassoEnd(null)
    }
  }, [dragNodeId, lassoStart, lassoEnd, timelineNodes, commitNodeMove])

  // ── Double click to create node ─────────────────────────────────────────────

  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    if (presentationMode) return
    if ((e.target as Element).closest('.node-card')) return
    const rect = containerRef.current!.getBoundingClientRect()
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, canvasTransform)
    await createNode({ x: pos.x - 120, y: pos.y - 40, date: Date.now() })
  }, [presentationMode, canvasTransform, createNode])

  // ── Touch: single finger pan, pinch zoom ───────────────────────────────────

  const lastTouchDistance = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy)
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const delta = (dist - lastTouchDistance.current) * 0.005
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, canvasTransform.scale + delta * canvasTransform.scale))
      setCanvasTransform({ scale: newScale })
      lastTouchDistance.current = dist
    }
  }

  const nowX = useMemo(() => {
    const sorted = [...timelineNodes].sort((a, b) => a.date - b.date)
    if (!sorted.length) return null
    const minDate = sorted[0].date
    const maxDate = sorted[sorted.length - 1].date
    const range = maxDate - minDate || 1
    return 100 + ((Date.now() - minDate) / range) * 2000
  }, [timelineNodes])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', bgClass)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ cursor: isPanning ? 'grabbing' : dragNodeId ? 'grabbing' : 'default' }}
    >
      {/* Ruler */}
      <TimelineRuler
        timeline={timeline}
        nodes={timelineNodes}
        transform={canvasTransform}
      />

      {/* Canvas transform layer */}
      <div
        className="canvas-surface absolute inset-0"
        style={{ transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`, transformOrigin: '0 0', willChange: 'transform' }}
      >
        {/* Lane tracks */}
        {timeline?.lanes.map((lane) => (
          <LaneTrack key={lane.id} lane={lane} nodes={timelineNodes.filter((n) => n.laneId === lane.id)} />
        ))}

        {/* Connection lines (SVG) */}
        <ConnectionLines nodes={timelineNodes} connections={timelineConnections} />

        {/* Now marker */}
        {settings?.profile.showNowMarker && nowX !== null && (
          <div className="now-marker" style={{ left: nowX }} />
        )}

        {/* Nodes */}
        <AnimatePresence>
          {timelineNodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isSelected={selection.selectedNodeIds.has(node.id)}
              cardDensity={settings?.profile.cardDensity ?? 'medium'}
              onPointerDown={(e) => {
                if (node.isLocked) return
                e.stopPropagation()
                const rect = containerRef.current!.getBoundingClientRect()
                const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, canvasTransform)
                setDragOffset({ x: pos.x - node.x, y: pos.y - node.y })
                setDragNodeId(node.id)
                selectNode(node.id, e.shiftKey)
              }}
              onClick={(e) => {
                e.stopPropagation()
                selectNode(node.id, e.shiftKey)
              }}
            />
          ))}
        </AnimatePresence>

        {/* Lasso rect */}
        {lassoStart && lassoEnd && (
          <div
            className="lasso-rect"
            style={{
              left: Math.min(lassoStart.x, lassoEnd.x),
              top: Math.min(lassoStart.y, lassoEnd.y),
              width: Math.abs(lassoEnd.x - lassoStart.x),
              height: Math.abs(lassoEnd.y - lassoStart.y),
            }}
          />
        )}
      </div>

      {/* FAB - mobile */}
      {!presentationMode && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            const rect = containerRef.current!.getBoundingClientRect()
            const cx = rect.width / 2
            const cy = rect.height / 2
            const pos = screenToCanvas(cx, cy, canvasTransform)
            await createNode({ x: pos.x - 120, y: pos.y - 40, date: Date.now() })
          }}
          className="absolute bottom-14 right-4 w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center z-20"
          style={{ background: 'rgb(var(--accent))' }}
          title="Add Node (double-click canvas)"
        >
          <Plus size={22} />
        </motion.button>
      )}

      {/* Empty state */}
      {timelineNodes.length === 0 && !presentationMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-2xl mb-2">✦</p>
            <p className="font-semibold text-[rgb(var(--text-muted))]">Double-click to add your first event</p>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-1 opacity-60">or use the + button</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
