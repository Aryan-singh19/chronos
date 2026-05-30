import type { TimelineNode, Tag } from '@/types'

// ─── Keyword-based Smart Tagging ──────────────────────────────────────────────

const TAG_RULES: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /\b(meeting|call|discussion|standup|sync)\b/i, tags: ['meeting', 'communication'] },
  { pattern: /\b(deploy|release|launch|ship|publish)\b/i, tags: ['release', 'deployment'] },
  { pattern: /\b(bug|fix|patch|error|crash|issue)\b/i, tags: ['bug', 'fix'] },
  { pattern: /\b(design|ui|ux|wireframe|mockup|figma)\b/i, tags: ['design'] },
  { pattern: /\b(research|study|analysis|review|survey)\b/i, tags: ['research'] },
  { pattern: /\b(deadline|due|milestone|target|goal)\b/i, tags: ['milestone'] },
  { pattern: /\b(war|battle|conflict|treaty|peace)\b/i, tags: ['historical', 'conflict'] },
  { pattern: /\b(chapter|scene|character|plot|story|arc)\b/i, tags: ['narrative', 'story'] },
  { pattern: /\b(data|database|api|backend|server|cloud)\b/i, tags: ['technical'] },
  { pattern: /\b(revenue|cost|budget|finance|money|funding)\b/i, tags: ['finance'] },
  { pattern: /\b(team|hire|onboard|employee|hr|people)\b/i, tags: ['people'] },
  { pattern: /\b(discovery|invention|breakthrough|innovation)\b/i, tags: ['innovation'] },
]

const PRIORITY_SIGNALS = {
  high: /\b(urgent|critical|asap|immediately|priority|blocker|p0|p1)\b/i,
  low: /\b(someday|eventually|nice.to.have|optional|backlog|later)\b/i,
}

// ─── Auto Summary ─────────────────────────────────────────────────────────────

export function generateAutoSummary(title: string, description: string): string {
  const stripped = description.replace(/<[^>]+>/g, '').trim()
  if (!stripped) return title

  // Extract first meaningful sentence
  const sentences = stripped.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  if (sentences.length === 0) return title

  const firstSentence = sentences[0].trim()
  if (firstSentence.length <= 120) return firstSentence

  // Truncate intelligently at word boundary
  const words = firstSentence.split(' ')
  let summary = ''
  for (const word of words) {
    if ((summary + ' ' + word).length > 120) break
    summary += (summary ? ' ' : '') + word
  }
  return summary + '…'
}

// ─── Smart Tag Suggestions ────────────────────────────────────────────────────

export function suggestTags(title: string, description: string): string[] {
  const text = `${title} ${description.replace(/<[^>]+>/g, '')}`
  const suggested = new Set<string>()

  for (const rule of TAG_RULES) {
    if (rule.pattern.test(text)) {
      rule.tags.forEach((t) => suggested.add(t))
    }
  }

  return Array.from(suggested).slice(0, 5)
}

// ─── Smart Priority Detection ─────────────────────────────────────────────────

export function suggestPriority(title: string, description: string): 'high' | 'medium' | 'low' {
  const text = `${title} ${description.replace(/<[^>]+>/g, '')}`
  if (PRIORITY_SIGNALS.high.test(text)) return 'high'
  if (PRIORITY_SIGNALS.low.test(text)) return 'low'
  return 'medium'
}

// ─── Smart Date Inference ─────────────────────────────────────────────────────

const DATE_PATTERNS = [
  // "January 15, 2024" or "Jan 15 2024"
  {
    re: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/i,
    parse: (m: RegExpMatchArray) => {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      }
      const month = months[m[1].toLowerCase().slice(0, 3)]
      const day = parseInt(m[2])
      const year = m[3] ? parseInt(m[3]) : new Date().getFullYear()
      return new Date(year, month, day).getTime()
    },
  },
  // "2024-01-15" or "01/15/2024"
  {
    re: /\b(\d{4})-(\d{2})-(\d{2})\b/,
    parse: (m: RegExpMatchArray) => new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime(),
  },
  // "15/01/2024"
  {
    re: /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
    parse: (m: RegExpMatchArray) => new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime(),
  },
]

export function inferDateFromText(text: string): number | null {
  const plain = text.replace(/<[^>]+>/g, '')
  for (const { re, parse } of DATE_PATTERNS) {
    const match = plain.match(re)
    if (match) {
      const ts = parse(match)
      if (!isNaN(ts)) return ts
    }
  }
  return null
}

// ─── Related Node Suggestions ─────────────────────────────────────────────────

export function suggestRelatedNodes(
  node: TimelineNode,
  allNodes: TimelineNode[],
): TimelineNode[] {
  if (allNodes.length < 2) return []

  const nodeText = `${node.title} ${node.description.replace(/<[^>]+>/g, '')}`.toLowerCase()
  const nodeWords = new Set(nodeText.split(/\W+/).filter((w) => w.length > 3))

  const scores = allNodes
    .filter((n) => n.id !== node.id)
    .map((n) => {
      const otherText = `${n.title} ${n.description.replace(/<[^>]+>/g, '')}`.toLowerCase()
      const otherWords = new Set(otherText.split(/\W+/).filter((w) => w.length > 3))

      // Jaccard similarity
      const intersection = [...nodeWords].filter((w) => otherWords.has(w)).length
      const union = new Set([...nodeWords, ...otherWords]).size
      const textSimilarity = union > 0 ? intersection / union : 0

      // Tag overlap
      const sharedTags = node.tags.filter((t) => n.tags.includes(t)).length
      const tagScore = sharedTags * 0.2

      // Temporal proximity (closer dates = more related)
      const daysDiff = Math.abs(node.date - n.date) / (1000 * 60 * 60 * 24)
      const temporalScore = Math.max(0, 1 - daysDiff / 365) * 0.1

      return { node: n, score: textSimilarity + tagScore + temporalScore }
    })
    .filter((s) => s.score > 0.05)
    .sort((a, b) => b.score - a.score)

  return scores.slice(0, 3).map((s) => s.node)
}

// ─── Full AI Analysis ─────────────────────────────────────────────────────────

export interface AIAnalysis {
  summary: string
  suggestedTags: string[]
  suggestedPriority: 'high' | 'medium' | 'low'
  inferredDate: number | null
  relatedNodes: TimelineNode[]
}

export function analyzeNode(node: TimelineNode, allNodes: TimelineNode[]): AIAnalysis {
  return {
    summary: generateAutoSummary(node.title, node.description),
    suggestedTags: suggestTags(node.title, node.description),
    suggestedPriority: suggestPriority(node.title, node.description),
    inferredDate: inferDateFromText(`${node.title} ${node.description}`),
    relatedNodes: suggestRelatedNodes(node, allNodes),
  }
}
