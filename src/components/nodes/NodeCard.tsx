'use client'

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lock, Pin, MoreHorizontal, Trash2, Copy, Link2, GitBranch,
} from 'lucide-react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useTimelineStore } from '@/stores'
import { cn, formatDate, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils'
import type { TimelineNode, CardDensity } from '@/types'

interface NodeCardProps {
  node: TimelineNode
  isSelected: boolean
  cardDensity: CardDensity
  onPointerDown: (e: React.PointerEvent) => void
  onClick: (e: React.MouseEvent) => void
}

export const NodeCard = memo(function NodeCard({
  node, isSelected, cardDensity, onPointerDown, onClick,
}: NodeCardProps) {
  const { deleteNode, updateNode } = useTimelineStore()
  const [isNew] = useState(true)

  const shapeStyles: Record<string, string> = {
    rectangle: 'rounded-xl',
    circle: 'rounded-full',
    diamond: 'rotate-45',
    hexagon: 'clip-path-hexagon',
  }

  const priorityColor = PRIORITY_COLORS[node.priority]
  const statusColor = STATUS_COLORS[node.status]

  const cardContent = (
    <div
      className={cn(
        'node-card absolute select-none',
        shapeStyles[node.shape] ?? 'rounded-xl',
        isSelected && 'selected',
        node.isLocked && 'locked',
        node.isPinned && 'pinned',
        node.shape === 'diamond' && 'overflow-hidden',
      )}
      style={{
        left: node.x,
        top: node.y,
        minWidth: cardDensity === 'minimal' ? 120 : 220,
        maxWidth: 320,
        borderLeft: `3px solid ${node.color}`,
        position: 'absolute',
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      {/* Priority badge - top left */}
      <div
        className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full border-2 border-[rgb(var(--surface))] z-10"
        style={{ background: priorityColor }}
        title={`Priority: ${node.priority}`}
      />

      {/* Lock icon */}
      {node.isLocked && (
        <div className="absolute top-1.5 right-1.5 text-[rgb(var(--text-muted))]">
          <Lock size={10} />
        </div>
      )}

      <div className={cn(
        'p-3',
        node.shape === 'diamond' && '-rotate-45',
      )}>
        {/* Title */}
        <p className={cn(
          'font-semibold text-[rgb(var(--text))] leading-snug truncate',
          cardDensity === 'minimal' ? 'text-xs' : 'text-sm',
        )}>
          {node.title}
        </p>

        {cardDensity !== 'minimal' && (
          <>
            {/* Date */}
            <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5">
              {formatDate(node.date, 'MMM d, yyyy')}
            </p>

            {cardDensity === 'rich' && (
              <>
                {/* Description excerpt */}
                {node.description && (
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1.5 line-clamp-2 leading-relaxed">
                    {node.description.replace(/<[^>]+>/g, '').slice(0, 80)}
                  </p>
                )}

                {/* Tags */}
                {node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {node.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${node.color}22`, color: node.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                  <span className="text-[9px] text-[rgb(var(--text-muted))] capitalize">
                    {node.status.replace('_', ' ')}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          {cardContent}
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content
            className="z-50 min-w-[180px] bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl shadow-xl p-1.5 text-sm"
          >
            <ContextMenu.Item
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text))]"
              onSelect={() => updateNode(node.id, { isLocked: !node.isLocked })}
            >
              <Lock size={14} />
              {node.isLocked ? 'Unlock' : 'Lock'} Node
            </ContextMenu.Item>
            <ContextMenu.Item
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text))]"
              onSelect={() => updateNode(node.id, { isPinned: !node.isPinned })}
            >
              <Pin size={14} />
              {node.isPinned ? 'Unpin' : 'Pin'} Node
            </ContextMenu.Item>
            <ContextMenu.Separator className="my-1 border-t border-[rgb(var(--border))]" />
            <ContextMenu.Item
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 dark:hover:bg-red-950"
              onSelect={() => deleteNode(node.id)}
            >
              <Trash2 size={14} />
              Delete Node
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </motion.div>
  )
})
