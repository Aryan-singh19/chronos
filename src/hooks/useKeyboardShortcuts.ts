import { useEffect } from 'react'
import { useTimelineStore, useAppStore } from '@/stores'

export function useKeyboardShortcuts() {
  const { undo, redo, clearSelection, deleteNode, selection, createNode, canvasTransform, setCanvasTransform } = useTimelineStore()
  const { settings } = useAppStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
      const ctrl = e.ctrlKey || e.metaKey

      // Always available
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return }

      if (isInput) return

      // Canvas shortcuts (not in input)
      if (e.key === 'Escape') { clearSelection(); return }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = [...selection.selectedNodeIds]
        if (ids.length > 0) ids.forEach((id) => deleteNode(id))
        return
      }

      // Zoom
      if (ctrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        setCanvasTransform({ scale: Math.min(4, canvasTransform.scale + 0.1) })
        return
      }
      if (ctrl && e.key === '-') {
        e.preventDefault()
        setCanvasTransform({ scale: Math.max(0.1, canvasTransform.scale - 0.1) })
        return
      }
      if (ctrl && e.key === '0') {
        e.preventDefault()
        setCanvasTransform({ x: 0, y: 0, scale: 1 })
        return
      }

      // Select all
      if (ctrl && e.key === 'a') {
        e.preventDefault()
        // handled at canvas level
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, clearSelection, deleteNode, selection, createNode, canvasTransform, setCanvasTransform])
}
