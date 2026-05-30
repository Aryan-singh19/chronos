import type { Timeline, TimelineNode, Project } from '@/types'
import { formatDate } from '@/lib/utils'

// ─── JSON Export ──────────────────────────────────────────────────────────────

export function exportAsJSON(data: {
  project?: Project
  timeline: Timeline
  nodes: TimelineNode[]
}): string {
  return JSON.stringify(data, null, 2)
}

export function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportAsCSV(nodes: TimelineNode[]): string {
  const headers = ['ID', 'Title', 'Date', 'Status', 'Priority', 'Tags', 'Description']
  const rows = nodes.map((n) => [
    n.id,
    `"${n.title.replace(/"/g, '""')}"`,
    formatDate(n.date),
    n.status,
    n.priority,
    `"${n.tags.join(', ')}"`,
    `"${n.description.replace(/<[^>]+>/g, '').replace(/"/g, '""').slice(0, 200)}"`,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function downloadCSV(nodes: TimelineNode[], filename: string) {
  const csv = exportAsCSV(nodes)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

export function parseCSV(csv: string): Partial<TimelineNode>[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })

    return {
      title: obj.title || obj.name || 'Untitled',
      description: obj.description || obj.notes || '',
      date: obj.date ? new Date(obj.date).getTime() : Date.now(),
      status: (obj.status as TimelineNode['status']) || 'todo',
      priority: (obj.priority as TimelineNode['priority']) || 'medium',
    }
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += line[i]
    }
  }
  result.push(current.trim())
  return result
}

// ─── HTML Export (read-only shareable) ───────────────────────────────────────

export function exportAsHTML(timeline: Timeline, nodes: TimelineNode[]): string {
  const sortedNodes = [...nodes].sort((a, b) => a.date - b.date)
  const nodesHTML = sortedNodes.map((node) => `
    <div class="node" style="border-left: 4px solid ${node.color}">
      <div class="node-header">
        <span class="node-title">${escapeHTML(node.title)}</span>
        <span class="node-date">${formatDate(node.date)}</span>
        <span class="node-priority priority-${node.priority}">${node.priority}</span>
        <span class="node-status status-${node.status}">${node.status.replace('_', ' ')}</span>
      </div>
      ${node.description ? `<div class="node-desc">${node.description}</div>` : ''}
      ${node.tags.length ? `<div class="node-tags">${node.tags.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(timeline.name)} — Chronos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #1e40af; margin-bottom: 0.5rem; }
    .meta { color: #64748b; margin-bottom: 2rem; }
    .timeline { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; margin: 0 auto; }
    .node { background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .node-header { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .node-title { font-weight: 600; font-size: 1rem; flex: 1; }
    .node-date { color: #64748b; font-size: 0.85rem; }
    .node-desc { color: #475569; font-size: 0.9rem; line-height: 1.6; margin-top: 0.5rem; }
    .node-priority, .node-status { font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px; font-weight: 500; }
    .priority-high { background: #fef2f2; color: #dc2626; }
    .priority-medium { background: #fffbeb; color: #d97706; }
    .priority-low { background: #f0fdf4; color: #16a34a; }
    .status-todo { background: #f1f5f9; color: #475569; }
    .status-in_progress { background: #eff6ff; color: #2563eb; }
    .status-done { background: #f0fdf4; color: #16a34a; }
    .node-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem; }
    .tag { background: #eff6ff; color: #2563eb; font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px; }
    footer { text-align: center; color: #94a3b8; font-size: 0.8rem; margin-top: 3rem; }
  </style>
</head>
<body>
  <div class="timeline">
    <div>
      <h1>${escapeHTML(timeline.name)}</h1>
      <p class="meta">Exported from Chronos · ${formatDate(Date.now())} · ${nodes.length} events</p>
    </div>
    ${nodesHTML}
    <footer>Generated by <strong>Chronos</strong> — Map the past. Build the future.</footer>
  </div>
</body>
</html>`
}

// ─── PNG Export ───────────────────────────────────────────────────────────────

export async function exportCanvasAsPNG(canvasElement: HTMLElement, filename: string) {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(canvasElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  })
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename)
  }, 'image/png')
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export async function exportAsPDF(timeline: Timeline, nodes: TimelineNode[], filename: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(30, 64, 175)
  doc.text(timeline.name, 20, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Exported ${formatDate(Date.now())} · ${nodes.length} events`, 20, 28)

  let y = 40
  const sortedNodes = [...nodes].sort((a, b) => a.date - b.date)

  for (const node of sortedNodes) {
    if (y > 185) { doc.addPage(); y = 20 }

    // Node card background
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(20, y, 257, 18, 3, 3, 'F')

    // Priority color bar
    const pc = node.priority === 'high' ? [239, 68, 68] : node.priority === 'medium' ? [245, 158, 11] : [34, 197, 94]
    doc.setFillColor(...(pc as [number, number, number]))
    doc.roundedRect(20, y, 3, 18, 1, 1, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(node.title.slice(0, 60), 27, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(formatDate(node.date), 27, y + 13)
    doc.text(node.status.replace('_', ' '), 100, y + 13)

    const plainDesc = node.description.replace(/<[^>]+>/g, '').slice(0, 80)
    if (plainDesc) {
      doc.setTextColor(71, 85, 105)
      doc.text(plainDesc, 150, y + 10)
    }

    y += 22
  }

  doc.save(filename)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
