// Lightweight test runner — no deps needed
import { readFileSync } from 'fs'

let passed = 0
let failed = 0
let total = 0
const results = []

// ── Mini test framework ─────────────────────────────────────────────────────
function describe(name, fn) { fn() }
function it(label, fn) {
  total++
  try {
    fn()
    passed++
    results.push({ status: 'PASS', label })
    process.stdout.write(`  ✓ ${label}\n`)
  } catch (e) {
    failed++
    results.push({ status: 'FAIL', label, error: e.message })
    process.stdout.write(`  ✗ ${label}\n    → ${e.message}\n`)
  }
}
function expect(val) {
  return {
    toBe: (exp) => { if (val !== exp) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toEqual: (exp) => { if (JSON.stringify(val) !== JSON.stringify(exp)) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`) },
    toBeTruthy: () => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy: () => { if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toBeNull: () => { if (val !== null) throw new Error(`Expected null, got ${JSON.stringify(val)}`) },
    not: {
      toBeNull: () => { if (val === null) throw new Error(`Expected non-null`) },
      toContain: (item) => { if (Array.isArray(val) && val.includes(item)) throw new Error(`Expected array NOT to contain ${item}`) },
      toBe: (exp) => { if (val === exp) throw new Error(`Expected not ${JSON.stringify(exp)}`) },
    },
    toContain: (item) => {
      if (Array.isArray(val)) {
        if (!val.includes(item)) throw new Error(`Expected [${val}] to contain "${item}"`)
      } else if (typeof val === 'string') {
        if (!val.includes(item)) throw new Error(`Expected "${val}" to contain "${item}"`)
      }
    },
    toHaveLength: (len) => { if (val.length !== len) throw new Error(`Expected length ${len}, got ${val.length}`) },
    toBeLessThanOrEqual: (exp) => { if (val > exp) throw new Error(`Expected ${val} <= ${exp}`) },
    toBeGreaterThan: (exp) => { if (val <= exp) throw new Error(`Expected ${val} > ${exp}`) },
    toEndWith: (suffix) => { if (!val.endsWith(suffix)) throw new Error(`Expected "${val}" to end with "${suffix}"`) },
  }
}

// ── Paste in the actual AI functions (extracted from src/lib/ai/index.ts) ────

const TAG_RULES = [
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

function generateAutoSummary(title, description) {
  const stripped = description.replace(/<[^>]+>/g, '').trim()
  if (!stripped) return title
  const sentences = stripped.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  if (!sentences.length) return title
  const firstSentence = sentences[0].trim()
  if (firstSentence.length <= 120) return firstSentence
  const words = firstSentence.split(' ')
  let summary = ''
  for (const word of words) {
    if ((summary + ' ' + word).length > 120) break
    summary += (summary ? ' ' : '') + word
  }
  return summary + '…'
}

function suggestTags(title, description) {
  const text = `${title} ${description.replace(/<[^>]+>/g, '')}`
  const suggested = new Set()
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(text)) rule.tags.forEach((t) => suggested.add(t))
  }
  return Array.from(suggested).slice(0, 5)
}

function suggestPriority(title, description) {
  const text = `${title} ${description.replace(/<[^>]+>/g, '')}`
  if (PRIORITY_SIGNALS.high.test(text)) return 'high'
  if (PRIORITY_SIGNALS.low.test(text)) return 'low'
  return 'medium'
}

const DATE_PATTERNS = [
  {
    re: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/i,
    parse: (m) => {
      const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 }
      return new Date(m[3] ? parseInt(m[3]) : new Date().getFullYear(), months[m[1].toLowerCase().slice(0,3)], parseInt(m[2])).getTime()
    },
  },
  { re: /\b(\d{4})-(\d{2})-(\d{2})\b/, parse: (m) => new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime() },
  { re: /\b(\d{2})\/(\d{2})\/(\d{4})\b/, parse: (m) => new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() },
]

function inferDateFromText(text) {
  const plain = text.replace(/<[^>]+>/g, '')
  for (const { re, parse } of DATE_PATTERNS) {
    const match = plain.match(re)
    if (match) { const ts = parse(match); if (!isNaN(ts)) return ts }
  }
  return null
}

function suggestRelatedNodes(node, allNodes) {
  if (allNodes.length < 2) return []
  const nodeText = `${node.title} ${node.description.replace(/<[^>]+>/g, '')}`.toLowerCase()
  const nodeWords = new Set(nodeText.split(/\W+/).filter((w) => w.length > 3))
  const scores = allNodes
    .filter((n) => n.id !== node.id)
    .map((n) => {
      const otherText = `${n.title} ${n.description.replace(/<[^>]+>/g, '')}`.toLowerCase()
      const otherWords = new Set(otherText.split(/\W+/).filter((w) => w.length > 3))
      const intersection = [...nodeWords].filter((w) => otherWords.has(w)).length
      const union = new Set([...nodeWords, ...otherWords]).size
      const textSim = union > 0 ? intersection / union : 0
      const sharedTags = node.tags.filter((t) => n.tags.includes(t)).length
      return { node: n, score: textSim + sharedTags * 0.2 }
    })
    .filter((s) => s.score > 0.05)
    .sort((a, b) => b.score - a.score)
  return scores.slice(0, 3).map((s) => s.node)
}

const mockNode = (o = {}) => ({
  id: 'test-1', timelineId: 'tl-1', title: 'Test Node', description: '',
  date: Date.now(), x: 0, y: 0, shape: 'rectangle', color: '#3b82f6',
  priority: 'medium', status: 'todo', tags: [], attachments: [], annotations: [],
  connections: [], linkedNodeIds: [], isLocked: false, isPinned: false,
  createdAt: Date.now(), updatedAt: Date.now(), ...o,
})

// ── Run tests ────────────────────────────────────────────────────────────────

console.log('\n📋 Chronos Test Suite\n')
console.log('━'.repeat(50))

console.log('\n🧠 AI: generateAutoSummary')
describe('generateAutoSummary', () => {
  it('returns title when description is empty', () => {
    expect(generateAutoSummary('My Title', '')).toBe('My Title')
  })
  it('extracts first sentence from plain description', () => {
    const r = generateAutoSummary('Title', 'This is the first sentence. Second sentence here.')
    expect(r).toBe('This is the first sentence')
  })
  it('truncates long descriptions at word boundary with ellipsis', () => {
    const long = 'word '.repeat(40)
    const r = generateAutoSummary('Title', long)
    expect(r.length).toBeLessThanOrEqual(123)
    expect(r).toEndWith('…')
  })
  it('strips HTML tags from description', () => {
    const r = generateAutoSummary('Title', '<p>Clean sentence here. More text.</p>')
    expect(r).toBe('Clean sentence here')
  })
  it('returns title when description has only short fragments', () => {
    expect(generateAutoSummary('My Title', 'Hi.')).toBe('My Title')
  })
})

console.log('\n🏷 AI: suggestTags')
describe('suggestTags', () => {
  it('suggests meeting tag for standup text', () => {
    expect(suggestTags('Weekly standup', 'team call sync')).toContain('meeting')
  })
  it('suggests release tag for deploy text', () => {
    expect(suggestTags('Deploy to prod', 'ship the release')).toContain('release')
  })
  it('suggests research tag', () => {
    expect(suggestTags('Literature review', 'research analysis survey')).toContain('research')
  })
  it('suggests bug tag for crash text', () => {
    expect(suggestTags('Fix crash', 'bug patch error')).toContain('bug')
  })
  it('suggests design tag', () => {
    expect(suggestTags('UI redesign', 'figma mockup wireframe ux')).toContain('design')
  })
  it('returns max 5 tags even with many matches', () => {
    const tags = suggestTags('meeting deploy release bug fix design research finance', '')
    expect(tags.length).toBeLessThanOrEqual(5)
  })
  it('suggests milestone tag for deadline text', () => {
    expect(suggestTags('Project deadline', 'due date milestone goal')).toContain('milestone')
  })
  it('suggests technical tag for API text', () => {
    expect(suggestTags('Backend API', 'database server cloud')).toContain('technical')
  })
})

console.log('\n⚡ AI: suggestPriority')
describe('suggestPriority', () => {
  it('returns high for urgent keyword', () => {
    expect(suggestPriority('URGENT fix needed', '')).toBe('high')
  })
  it('returns high for critical keyword', () => {
    expect(suggestPriority('critical blocker', '')).toBe('high')
  })
  it('returns high for p0/p1 labels', () => {
    expect(suggestPriority('P0 issue', '')).toBe('high')
  })
  it('returns low for backlog keyword', () => {
    expect(suggestPriority('Backlog item', 'someday maybe')).toBe('low')
  })
  it('returns low for nice-to-have', () => {
    expect(suggestPriority('nice to have feature', '')).toBe('low')
  })
  it('defaults to medium', () => {
    expect(suggestPriority('Normal task', 'Do some work here')).toBe('medium')
  })
  it('returns low for eventually keyword', () => {
    expect(suggestPriority('Eventually refactor this', '')).toBe('low')
  })
})

console.log('\n📅 AI: inferDateFromText')
describe('inferDateFromText', () => {
  it('infers date from ISO format YYYY-MM-DD', () => {
    const r = inferDateFromText('Scheduled for 2024-06-15')
    expect(r).not.toBeNull()
    expect(new Date(r).getFullYear()).toBe(2024)
    expect(new Date(r).getMonth()).toBe(5)
  })
  it('infers date from written month format', () => {
    const r = inferDateFromText('Event on January 15, 2024')
    expect(r).not.toBeNull()
    expect(new Date(r).getMonth()).toBe(0)
  })
  it('infers abbreviated month', () => {
    const r = inferDateFromText('Meeting on Mar 5, 2025')
    expect(r).not.toBeNull()
    expect(new Date(r).getMonth()).toBe(2)
  })
  it('infers from DD/MM/YYYY format', () => {
    const r = inferDateFromText('Deadline: 25/12/2024')
    expect(r).not.toBeNull()
    expect(new Date(r).getMonth()).toBe(11)
  })
  it('returns null when no date found', () => {
    expect(inferDateFromText('No date here at all')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(inferDateFromText('')).toBeNull()
  })
  it('strips HTML before parsing', () => {
    const r = inferDateFromText('<p>Event on <b>2024-03-10</b></p>')
    expect(r).not.toBeNull()
  })
})

console.log('\n🔗 AI: suggestRelatedNodes')
describe('suggestRelatedNodes', () => {
  it('returns empty array for single node', () => {
    const n = mockNode({ title: 'Research AI' })
    expect(suggestRelatedNodes(n, [n])).toHaveLength(0)
  })
  it('returns empty array for empty list', () => {
    const n = mockNode({ title: 'Research AI' })
    expect(suggestRelatedNodes(n, [])).toHaveLength(0)
  })
  it('finds similar node by text overlap', () => {
    const node    = mockNode({ id:'1', title:'Research AI models', description:'machine learning study' })
    const similar = mockNode({ id:'2', title:'AI research paper',  description:'machine learning analysis' })
    const unrelated = mockNode({ id:'3', title:'Birthday party',   description:'cake decorations balloons' })
    const result = suggestRelatedNodes(node, [node, similar, unrelated])
    expect(result.map(n=>n.id)).toContain('2')
  })
  it('does not suggest unrelated nodes', () => {
    const node    = mockNode({ id:'1', title:'Research AI models', description:'machine learning study' })
    const similar = mockNode({ id:'2', title:'AI research paper',  description:'machine learning analysis' })
    const unrelated = mockNode({ id:'3', title:'Birthday party',   description:'cake decorations balloons' })
    const result = suggestRelatedNodes(node, [node, similar, unrelated])
    expect(result.map(n=>n.id)).not.toContain('3')
  })
  it('boosts nodes with matching tags', () => {
    const node    = mockNode({ id:'1', title:'Sprint planning', tags:['sprint','dev'] })
    const tagged  = mockNode({ id:'2', title:'Sprint review',   tags:['sprint','dev'], description:'sprint work' })
    const notag   = mockNode({ id:'3', title:'Something else',  tags:[] })
    const result  = suggestRelatedNodes(node, [node, tagged, notag])
    expect(result[0].id).toBe('2')
  })
  it('returns max 3 suggestions', () => {
    const node  = mockNode({ id:'0', title:'machine learning research data analysis' })
    const others = Array.from({length:10}, (_,i) =>
      mockNode({ id:`${i+1}`, title:`machine learning research data ${i}`, description:'analysis study' })
    )
    const result = suggestRelatedNodes(node, [node, ...others])
    expect(result.length).toBeLessThanOrEqual(3)
  })
})

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '━'.repeat(50))
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed, ${total} total\n`)

if (failed > 0) {
  console.log('❌ FAILED TESTS:')
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  • ${r.label}: ${r.error}`)
  })
  process.exit(1)
} else {
  console.log('✅ All tests passed!\n')
}
