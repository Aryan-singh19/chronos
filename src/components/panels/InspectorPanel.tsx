'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X, Sparkles, Calendar, Tag, AlertCircle, Circle, CheckCircle2,
  Archive, Loader2, Link2, Lock, Pin,
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { useTimelineStore } from '@/stores'
import { analyzeNode } from '@/lib/ai'
import { formatDate, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils'
import type { ID, Priority, NodeStatus, NodeShape } from '@/types'

const SHAPES: NodeShape[] = ['rectangle', 'circle', 'diamond', 'hexagon']
const STATUSES: { value: NodeStatus; label: string; icon: typeof Circle }[] = [
  { value: 'todo', label: 'To Do', icon: Circle },
  { value: 'in_progress', label: 'In Progress', icon: AlertCircle },
  { value: 'done', label: 'Done', icon: CheckCircle2 },
  { value: 'archived', label: 'Archived', icon: Archive },
]

interface InspectorPanelProps {
  nodeId: ID | null
  timelineId: ID
  onClose: () => void
}

export function InspectorPanel({ nodeId, timelineId, onClose }: InspectorPanelProps) {
  const { nodes, updateNode } = useTimelineStore()
  const node = nodeId ? nodes[nodeId] : null
  const allNodes = Object.values(nodes).filter((n) => n.timelineId === timelineId)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{ tags: string[]; relatedIds: ID[] } | null>(null)
  const [tagInput, setTagInput] = useState('')

  const editor = useEditor({
    extensions: [StarterKit, Highlight, Link.configure({ openOnClick: false })],
    content: node?.description ?? '',
    onUpdate: ({ editor }) => {
      if (node) updateNode(node.id, { description: editor.getHTML() })
    },
    editorProps: {
      attributes: { class: 'tiptap-editor focus:outline-none', 'data-placeholder': 'Add description…' },
    },
  })

  useEffect(() => {
    if (node && editor && editor.getHTML() !== node.description) {
      editor.commands.setContent(node.description ?? '')
    }
  }, [editor, node])

  const runAI = useCallback(async () => {
    if (!node) return
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // simulate
    const analysis = analyzeNode(node, allNodes)
    setAiSuggestions({ tags: analysis.suggestedTags, relatedIds: analysis.relatedNodes.map((n) => n.id) })
    // Auto-apply summary if no description
    if (!node.description && analysis.summary !== node.title) {
      updateNode(node.id, { aiSummary: analysis.summary })
    }
    // Auto-apply date if missing
    if (analysis.inferredDate) {
      updateNode(node.id, { date: analysis.inferredDate })
    }
    setAiLoading(false)
  }, [node, allNodes, updateNode])

  if (!node) {
    return (
      <div className="flex flex-col h-full p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Inspector</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-2xl mb-2">✦</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">Select a node to view its details</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgb(var(--border))] shrink-0">
        <div className="w-3 h-3 rounded-full" style={{ background: node.color }} />
        <span className="font-semibold text-sm flex-1 truncate">{node.title}</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]">
          <X size={15} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* AI analysis */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={runAI}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium disabled:opacity-60"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? 'Analyzing…' : 'Analyze node'}
          </motion.button>

          {/* AI suggestions */}
          {aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-950 rounded-xl p-3 space-y-2"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">AI Suggestions</p>
              {aiSuggestions.tags.length > 0 && (
                <div>
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-1">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestions.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => !node.tags.includes(tag) && updateNode(node.id, { tags: [...node.tags, tag] })}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Title</label>
            <input
              value={node.title}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
              className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">
              <Calendar size={11} className="inline mr-1" />Date
            </label>
            <input
              type="date"
              value={new Date(node.date).toISOString().split('T')[0]}
              onChange={(e) => updateNode(node.id, { date: new Date(e.target.value).getTime() })}
              className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Priority</label>
            <div className="flex gap-1.5">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => updateNode(node.id, { priority: p })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                    node.priority === p
                      ? 'border-transparent text-white'
                      : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--text-muted))]'
                  }`}
                  style={node.priority === p ? { background: PRIORITY_COLORS[p] } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Status</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUSES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateNode(node.id, { status: value })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    node.status === value
                      ? 'border-transparent text-white'
                      : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
                  }`}
                  style={node.status === value ? { background: STATUS_COLORS[value] } : {}}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Shape</label>
            <div className="flex gap-1.5">
              {SHAPES.map((shape) => (
                <button
                  key={shape}
                  onClick={() => updateNode(node.id, { shape })}
                  className={`flex-1 py-1.5 rounded-lg text-xs capitalize border transition-all ${
                    node.shape === shape
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600'
                      : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={node.color}
                onChange={(e) => updateNode(node.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[rgb(var(--border))] bg-transparent"
              />
              <span className="text-xs font-mono text-[rgb(var(--text-muted))]">{node.color}</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">
              <Tag size={11} className="inline mr-1" />Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {node.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-[rgb(var(--surface-2))] px-2 py-1 rounded-full">
                  {tag}
                  <button
                    onClick={() => updateNode(node.id, { tags: node.tags.filter((t) => t !== tag) })}
                    className="text-[rgb(var(--text-muted))] hover:text-red-500 transition-colors"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  updateNode(node.id, { tags: [...node.tags, tagInput.trim()] })
                  setTagInput('')
                }
              }}
              placeholder="Add tag + Enter"
              className="w-full bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Description (rich text) */}
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))] block mb-1.5">Description</label>
            <div className="bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl px-3 py-2 min-h-[100px] tiptap-editor">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Lock & Pin */}
          <div className="flex gap-2">
            <button
              onClick={() => updateNode(node.id, { isLocked: !node.isLocked })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border transition-all ${
                node.isLocked ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950' : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
              }`}
            >
              <Lock size={12} />{node.isLocked ? 'Locked' : 'Lock'}
            </button>
            <button
              onClick={() => updateNode(node.id, { isPinned: !node.isPinned })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border transition-all ${
                node.isPinned ? 'border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-950' : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-2))]'
              }`}
            >
              <Pin size={12} />{node.isPinned ? 'Pinned' : 'Pin'}
            </button>
          </div>

          {/* Metadata */}
          <div className="text-xs text-[rgb(var(--text-muted))] space-y-0.5 pt-2 border-t border-[rgb(var(--border))]">
            <p>Created: {formatDate(node.createdAt)}</p>
            <p>Updated: {formatDate(node.updatedAt)}</p>
            <p className="font-mono opacity-60">{node.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

