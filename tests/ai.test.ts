import { describe, it, expect } from 'vitest'
import {
  generateAutoSummary,
  suggestTags,
  suggestPriority,
  inferDateFromText,
  suggestRelatedNodes,
} from '@/lib/ai'
import type { TimelineNode } from '@/types'

const mockNode = (overrides: Partial<TimelineNode> = {}): TimelineNode => ({
  id: 'test-1',
  timelineId: 'tl-1',
  title: 'Test Node',
  description: '',
  date: Date.now(),
  x: 0, y: 0,
  shape: 'rectangle',
  color: '#3b82f6',
  priority: 'medium',
  status: 'todo',
  tags: [],
  attachments: [],
  annotations: [],
  connections: [],
  linkedNodeIds: [],
  isLocked: false,
  isPinned: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

describe('AI: generateAutoSummary', () => {
  it('returns title when description is empty', () => {
    expect(generateAutoSummary('My Title', '')).toBe('My Title')
  })

  it('extracts first sentence from description', () => {
    const result = generateAutoSummary('Title', 'This is the first sentence. Second sentence here.')
    expect(result).toBe('This is the first sentence')
  })

  it('truncates long descriptions at word boundary', () => {
    const long = 'word '.repeat(40)
    const result = generateAutoSummary('Title', long)
    expect(result.length).toBeLessThanOrEqual(123)
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('AI: suggestTags', () => {
  it('suggests meeting tag for meeting-related text', () => {
    const tags = suggestTags('Team meeting', 'Weekly standup call with the team')
    expect(tags).toContain('meeting')
  })

  it('suggests research tag for research text', () => {
    const tags = suggestTags('Literature review', 'Research and analysis of existing studies')
    expect(tags).toContain('research')
  })

  it('suggests release tag for deployment text', () => {
    const tags = suggestTags('Deploy to prod', 'Release v2.0 to production servers')
    expect(tags).toContain('release')
  })

  it('returns max 5 tags', () => {
    const tags = suggestTags('meeting deploy release bug fix design research', '')
    expect(tags.length).toBeLessThanOrEqual(5)
  })
})

describe('AI: suggestPriority', () => {
  it('detects high priority from urgent keyword', () => {
    expect(suggestPriority('URGENT fix needed', '')).toBe('high')
  })

  it('detects low priority from backlog keyword', () => {
    expect(suggestPriority('Backlog item', 'someday maybe')).toBe('low')
  })

  it('defaults to medium priority', () => {
    expect(suggestPriority('Normal task', 'Do some work here')).toBe('medium')
  })
})

describe('AI: inferDateFromText', () => {
  it('infers date from ISO format', () => {
    const result = inferDateFromText('Scheduled for 2024-06-15')
    expect(result).not.toBeNull()
    const d = new Date(result!)
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(5) // June = 5
  })

  it('infers date from written month format', () => {
    const result = inferDateFromText('Event on January 15, 2024')
    expect(result).not.toBeNull()
  })

  it('returns null when no date found', () => {
    expect(inferDateFromText('No date here at all')).toBeNull()
  })
})

describe('AI: suggestRelatedNodes', () => {
  it('returns empty array for single node', () => {
    const node = mockNode({ title: 'Research AI' })
    expect(suggestRelatedNodes(node, [node])).toHaveLength(0)
  })

  it('suggests related nodes by text similarity', () => {
    const node = mockNode({ id: '1', title: 'Research AI models', description: 'machine learning study' })
    const similar = mockNode({ id: '2', title: 'AI research paper', description: 'machine learning analysis' })
    const unrelated = mockNode({ id: '3', title: 'Birthday party planning', description: 'cake and decorations' })
    const result = suggestRelatedNodes(node, [node, similar, unrelated])
    const resultIds = result.map((n) => n.id)
    expect(resultIds).toContain('2')
    expect(resultIds).not.toContain('3')
  })
})
