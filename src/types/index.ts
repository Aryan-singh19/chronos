// ─── Core Entity Types ────────────────────────────────────────────────────────

export type ID = string

export type Priority = 'high' | 'medium' | 'low'
export type NodeStatus = 'todo' | 'in_progress' | 'done' | 'archived'
export type NodeShape = 'rectangle' | 'circle' | 'diamond' | 'hexagon'
export type ConnectionStyle = 'curved' | 'straight' | 'orthogonal'
export type TimeScale = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom'
export type ViewMode = 'timeline' | 'gantt' | 'kanban' | 'calendar'
export type CardDensity = 'minimal' | 'medium' | 'rich'
export type BackgroundStyle = 'grid' | 'dots' | 'lines' | 'blank'
export type AnimationStyle = 'spring' | 'linear' | 'ease'

// ─── Media Attachment ─────────────────────────────────────────────────────────

export interface MediaAttachment {
  id: ID
  type: 'image' | 'video' | 'pdf' | 'audio' | 'file'
  name: string
  localPath?: string
  dataUrl?: string
  size: number
  mimeType: string
  createdAt: number
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: ID
  name: string
  color: string
}

// ─── Connection ───────────────────────────────────────────────────────────────

export interface Connection {
  id: ID
  fromNodeId: ID
  toNodeId: ID
  style: ConnectionStyle
  label?: string
  type: 'arrow' | 'dependency'
  color?: string
}

// ─── Annotation ───────────────────────────────────────────────────────────────

export interface Annotation {
  id: ID
  content: string
  x: number
  y: number
  color: string
  createdAt: number
}

// ─── Timeline Node ────────────────────────────────────────────────────────────

export interface TimelineNode {
  id: ID
  timelineId: ID
  title: string
  description: string // rich text HTML
  date: number // unix timestamp
  endDate?: number
  x: number
  y: number
  laneId?: ID
  shape: NodeShape
  color: string
  iconName?: string
  priority: Priority
  status: NodeStatus
  tags: ID[]
  attachments: MediaAttachment[]
  annotations: Annotation[]
  connections: ID[]
  subTimelineId?: ID // nested timeline
  linkedNodeIds: ID[]
  isLocked: boolean
  isPinned: boolean
  createdAt: number
  updatedAt: number
  // AI fields
  aiSummary?: string
  aiSuggestedTags?: string[]
}

// ─── Lane / Track ─────────────────────────────────────────────────────────────

export interface Lane {
  id: ID
  timelineId: ID
  name: string
  color: string
  order: number
  isCollapsed: boolean
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface Timeline {
  id: ID
  projectId: ID
  name: string
  description?: string
  timeScale: TimeScale
  customScaleUnit?: string
  startDate?: number
  endDate?: number
  lanes: Lane[]
  tags: Tag[]
  backgroundStyle: BackgroundStyle
  createdAt: number
  updatedAt: number
  parentNodeId?: ID // if this is a nested timeline
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: ID
  name: string
  description?: string
  color: string
  icon?: string
  timelineIds: ID[]
  createdAt: number
  updatedAt: number
  isArchived: boolean
}

// ─── Version Snapshot ─────────────────────────────────────────────────────────

export interface VersionSnapshot {
  id: ID
  timelineId: ID
  label: string
  description?: string
  data: string // JSON serialized timeline state
  createdAt: number
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  avatarUrl?: string
  accentColor: string
  theme: 'light' | 'dark' | 'system'
  cardDensity: CardDensity
  animationStyle: AnimationStyle
  backgroundStyle: BackgroundStyle
  showNowMarker: boolean
  showMinimap: boolean
  enableEncryption: boolean
  encryptionKey?: string
  language: string
  customShortcuts: Record<string, string>
  autoSaveInterval: number // seconds
  backupSchedule: 'daily' | 'weekly' | 'manual'
  lastBackupAt?: number
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  profile: UserProfile
  onboardingComplete: boolean
  version: string
  lastOpenedProjectId?: ID
  lastOpenedTimelineId?: ID
  recentItems: RecentItem[]
  installedAt: number
}

// ─── Recent Item ──────────────────────────────────────────────────────────────

export interface RecentItem {
  id: ID
  type: 'project' | 'timeline' | 'node'
  title: string
  projectId?: ID
  timelineId?: ID
  visitedAt: number
}

// ─── Canvas State ─────────────────────────────────────────────────────────────

export interface CanvasTransform {
  x: number
  y: number
  scale: number
}

export interface SelectionState {
  selectedNodeIds: Set<ID>
  isLassoActive: boolean
  lassoRect?: { x: number; y: number; width: number; height: number }
}

// ─── Undo/Redo Action ─────────────────────────────────────────────────────────

export type UndoAction =
  | { type: 'CREATE_NODE'; node: TimelineNode }
  | { type: 'DELETE_NODE'; node: TimelineNode }
  | { type: 'UPDATE_NODE'; before: TimelineNode; after: TimelineNode }
  | { type: 'MOVE_NODE'; nodeId: ID; before: { x: number; y: number }; after: { x: number; y: number } }
  | { type: 'CREATE_CONNECTION'; connection: Connection }
  | { type: 'DELETE_CONNECTION'; connection: Connection }
  | { type: 'CREATE_LANE'; lane: Lane }
  | { type: 'DELETE_LANE'; lane: Lane }

// ─── Export Options ───────────────────────────────────────────────────────────

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'png' | 'html'
  includeAttachments: boolean
  timelineId?: ID
  projectId?: ID
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface TimelineTemplate {
  id: string
  name: string
  description: string
  category: 'research' | 'story' | 'project' | 'history'
  preview: string
  defaultNodes: Partial<TimelineNode>[]
  defaultLanes: Partial<Lane>[]
  timeScale: TimeScale
}

// ─── Search Result ────────────────────────────────────────────────────────────

export interface SearchResult {
  type: 'node' | 'timeline' | 'project'
  id: ID
  title: string
  subtitle?: string
  projectId?: ID
  timelineId?: ID
  score: number
}

// ─── System Health ────────────────────────────────────────────────────────────

export interface SystemHealth {
  memoryUsedMB: number
  memoryLimitMB: number
  fps: number
  dbSizeMB: number
  cacheHitRate: number
  isHealthy: boolean
}

// ─── Changelog Entry ──────────────────────────────────────────────────────────

export interface ChangelogEntry {
  version: string
  date: string
  highlights: string[]
  changes: { type: 'new' | 'improved' | 'fixed'; text: string }[]
}
