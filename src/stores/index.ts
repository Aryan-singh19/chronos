import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type {
  Project,
  Timeline,
  TimelineNode,
  Connection,
  Lane,
  CanvasTransform,
  SelectionState,
  UndoAction,
  ViewMode,
  ID,
  AppSettings,
  UserProfile,
  SystemHealth,
  RecentItem,
} from '@/types'
import {
  projectsDB,
  timelinesDB,
  nodesDB,
  connectionsDB,
  settingsDB,
  estimateDBSize,
} from '@/lib/db'

// ─── App Store ────────────────────────────────────────────────────────────────

interface AppState {
  settings: AppSettings | null
  isLoading: boolean
  isInitialized: boolean
  systemHealth: SystemHealth
  // Actions
  initialize: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  addRecentItem: (item: Omit<RecentItem, 'visitedAt'>) => Promise<void>
  updateSystemHealth: (health: Partial<SystemHealth>) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    name: 'Chronos User',
    accentColor: '#2563eb',
    theme: 'system',
    cardDensity: 'medium',
    animationStyle: 'spring',
    backgroundStyle: 'dots',
    showNowMarker: false,
    showMinimap: true,
    enableEncryption: false,
    language: 'en',
    customShortcuts: {},
    autoSaveInterval: 30,
    backupSchedule: 'daily',
  },
  onboardingComplete: false,
  version: '1.0.0',
  recentItems: [],
  installedAt: Date.now(),
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    settings: null,
    isLoading: false,
    isInitialized: false,
    systemHealth: {
      memoryUsedMB: 0,
      memoryLimitMB: 0,
      fps: 60,
      dbSizeMB: 0,
      cacheHitRate: 0,
      isHealthy: true,
    },

    initialize: async () => {
      set((s) => { s.isLoading = true })
      try {
        let settings = await settingsDB.get()
        if (!settings) {
          settings = DEFAULT_SETTINGS
          await settingsDB.save(settings)
        } else {
          settings = {
            ...DEFAULT_SETTINGS,
            ...settings,
            profile: {
              ...DEFAULT_SETTINGS.profile,
              ...settings.profile,
            },
            recentItems: settings.recentItems ?? [],
          }
          await settingsDB.save(settings)
        }
        set((s) => {
          s.settings = settings!
          s.isInitialized = true
          s.isLoading = false
        })
      } catch (e) {
        console.error('Failed to initialize app', e)
        set((s) => { s.isLoading = false; s.isInitialized = true; s.settings = DEFAULT_SETTINGS })
      }
    },

    updateProfile: async (profile) => {
      const { settings } = get()
      if (!settings) return
      const updated = { ...settings, profile: { ...settings.profile, ...profile } }
      set((s) => { s.settings = updated })
      await settingsDB.save(updated)
    },

    addRecentItem: async (item) => {
      const { settings } = get()
      if (!settings) return
      const newItem: RecentItem = { ...item, visitedAt: Date.now() }
      const filtered = settings.recentItems
        .filter((r) => !(r.id === item.id && r.type === item.type))
        .slice(0, 19)
      const updated = { ...settings, recentItems: [newItem, ...filtered] }
      set((s) => { s.settings = updated })
      await settingsDB.save(updated)
    },

    updateSystemHealth: (health) => {
      set((s) => { s.systemHealth = { ...s.systemHealth, ...health } })
    },
  })),
)

// ─── Projects Store ───────────────────────────────────────────────────────────

interface ProjectsState {
  projects: Project[]
  activeProjectId: ID | null
  // Actions
  loadProjects: () => Promise<void>
  createProject: (data: Pick<Project, 'name' | 'description' | 'color' | 'icon'>) => Promise<Project>
  updateProject: (id: ID, data: Partial<Project>) => Promise<void>
  deleteProject: (id: ID) => Promise<void>
  setActiveProject: (id: ID | null) => void
}

export const useProjectsStore = create<ProjectsState>()(
  immer((set, get) => ({
    projects: [],
    activeProjectId: null,

    loadProjects: async () => {
      const projects = await projectsDB.getAll()
      set((s) => { s.projects = projects.sort((a, b) => b.updatedAt - a.updatedAt) })
    },

    createProject: async (data) => {
      const now = Date.now()
      const projectId = nanoid()
      const starterTimelineId = nanoid()
      const starterTimeline: Timeline = {
        id: starterTimelineId,
        projectId,
        name: 'Main Timeline',
        description: 'Your starting point for mapping events, milestones, and ideas.',
        timeScale: 'day',
        lanes: [],
        tags: [],
        backgroundStyle: 'dots',
        createdAt: now,
        updatedAt: now,
      }
      const project: Project = {
        id: projectId,
        ...data,
        timelineIds: [starterTimelineId],
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      }
      await Promise.all([projectsDB.save(project), timelinesDB.save(starterTimeline)])
      set((s) => { s.projects.unshift(project) })
      return project
    },

    updateProject: async (id, data) => {
      const updated = { ...get().projects.find((p) => p.id === id)!, ...data, updatedAt: Date.now() }
      await projectsDB.save(updated)
      set((s) => {
        const idx = s.projects.findIndex((p) => p.id === id)
        if (idx !== -1) s.projects[idx] = updated
      })
    },

    deleteProject: async (id) => {
      await projectsDB.delete(id)
      set((s) => { s.projects = s.projects.filter((p) => p.id !== id) })
    },

    setActiveProject: (id) => set((s) => { s.activeProjectId = id }),
  })),
)

// ─── Timeline Store ───────────────────────────────────────────────────────────

interface TimelineState {
  timelines: Record<ID, Timeline>
  activeTimelineId: ID | null
  nodes: Record<ID, TimelineNode>
  connections: Record<ID, Connection>
  viewMode: ViewMode
  canvasTransform: CanvasTransform
  selection: SelectionState
  undoStack: UndoAction[]
  redoStack: UndoAction[]
  isDirty: boolean
  isReplayingHistory: boolean
  // Actions
  loadTimeline: (id: ID) => Promise<void>
  createTimeline: (projectId: ID, data: Partial<Timeline>) => Promise<Timeline>
  updateTimeline: (id: ID, data: Partial<Timeline>) => Promise<void>
  setActiveTimeline: (id: ID | null) => void
  setViewMode: (mode: ViewMode) => void
  setCanvasTransform: (t: Partial<CanvasTransform>) => void
  // Node actions
  createNode: (data: Partial<TimelineNode>) => Promise<TimelineNode>
  updateNode: (id: ID, data: Partial<TimelineNode>) => Promise<void>
  deleteNode: (id: ID) => Promise<void>
  deleteNodes: (ids: ID[]) => Promise<void>
  moveNode: (id: ID, x: number, y: number) => void
  commitNodeMove: (id: ID) => Promise<void>
  duplicateTimeline: (id: ID) => Promise<Timeline>
  // Connection actions
  createConnection: (data: Partial<Connection>) => Promise<Connection>
  deleteConnection: (id: ID) => Promise<void>
  // Selection
  selectNode: (id: ID, multi?: boolean) => void
  selectNodes: (ids: ID[]) => void
  clearSelection: () => void
  // Undo/Redo
  undo: () => Promise<void>
  redo: () => Promise<void>
  pushUndo: (action: UndoAction) => void
}

export const useTimelineStore = create<TimelineState>()(
  immer((set, get) => ({
    timelines: {},
    activeTimelineId: null,
    nodes: {},
    connections: {},
    viewMode: 'timeline',
    canvasTransform: { x: 0, y: 0, scale: 1 },
    selection: { selectedNodeIds: new Set(), isLassoActive: false },
    undoStack: [],
    redoStack: [],
    isDirty: false,
    isReplayingHistory: false,

    loadTimeline: async (id) => {
      const [timeline, nodes, connections] = await Promise.all([
        timelinesDB.get(id),
        nodesDB.getByTimeline(id),
        connectionsDB.getByTimeline(id),
      ])
      if (!timeline) return
      set((s) => {
        s.timelines[id] = timeline
        s.activeTimelineId = id
        nodes.forEach((n) => { s.nodes[n.id] = n })
        connections.forEach((c) => { s.connections[c.id] = c })
        s.isDirty = false
      })
    },

    createTimeline: async (projectId, data) => {
      const timeline: Timeline = {
        id: nanoid(),
        projectId,
        name: data.name ?? 'Untitled Timeline',
        timeScale: data.timeScale ?? 'day',
        lanes: [],
        tags: [],
        backgroundStyle: data.backgroundStyle ?? 'dots',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...data,
      }
      await timelinesDB.save(timeline)
      set((s) => { s.timelines[timeline.id] = timeline })
      return timeline
    },

    updateTimeline: async (id, data) => {
      const current = get().timelines[id]
      if (!current) return
      const updated = { ...current, ...data, updatedAt: Date.now() }
      await timelinesDB.save(updated)
      set((s) => { s.timelines[id] = updated; s.isDirty = false })
    },

    setActiveTimeline: (id) => set((s) => { s.activeTimelineId = id }),
    setViewMode: (mode) => set((s) => { s.viewMode = mode }),
    setCanvasTransform: (t) =>
      set((s) => { s.canvasTransform = { ...s.canvasTransform, ...t } }),

    createNode: async (data) => {
      const timelineId = get().activeTimelineId!
      const node: TimelineNode = {
        id: nanoid(),
        timelineId,
        title: data.title ?? 'New Event',
        description: data.description ?? '',
        date: data.date ?? Date.now(),
        x: data.x ?? 100,
        y: data.y ?? 100,
        shape: data.shape ?? 'rectangle',
        color: data.color ?? '#3b82f6',
        priority: data.priority ?? 'medium',
        status: data.status ?? 'todo',
        tags: data.tags ?? [],
        attachments: data.attachments ?? [],
        annotations: data.annotations ?? [],
        connections: data.connections ?? [],
        linkedNodeIds: data.linkedNodeIds ?? [],
        isLocked: false,
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...data,
      }
      await nodesDB.save(node)
      set((s) => { s.nodes[node.id] = node; s.isDirty = true })
      get().pushUndo({ type: 'CREATE_NODE', node })
      return node
    },

    updateNode: async (id, data) => {
      const current = get().nodes[id]
      if (!current) return
      const before = { ...current }
      const updated = { ...current, ...data, updatedAt: Date.now() }
      await nodesDB.save(updated)
      set((s) => { s.nodes[id] = updated; s.isDirty = true })
      get().pushUndo({ type: 'UPDATE_NODE', before, after: updated })
    },

    deleteNode: async (id) => {
      const node = get().nodes[id]
      if (!node) return
      await nodesDB.delete(id)
      set((s) => { delete s.nodes[id]; s.isDirty = true })
      get().pushUndo({ type: 'DELETE_NODE', node })
    },

    deleteNodes: async (ids) => {
      await nodesDB.deleteMany(ids)
      set((s) => { ids.forEach((id) => delete s.nodes[id]); s.isDirty = true })
    },

    moveNode: (id, x, y) => {
      set((s) => {
        if (s.nodes[id]) { s.nodes[id].x = x; s.nodes[id].y = y }
      })
    },

    commitNodeMove: async (id) => {
      const node = get().nodes[id]
      if (node) await nodesDB.save(node)
    },

    duplicateTimeline: async (id) => {
      const original = get().timelines[id]
      if (!original) throw new Error('Timeline not found')
      const newTimeline: Timeline = { ...original, id: nanoid(), name: `${original.name} (Copy)`, createdAt: Date.now(), updatedAt: Date.now() }
      const originalNodes = Object.values(get().nodes).filter((n) => n.timelineId === id)
      const newNodes = originalNodes.map((n) => ({ ...n, id: nanoid(), timelineId: newTimeline.id }))
      await timelinesDB.save(newTimeline)
      await nodesDB.saveMany(newNodes)
      set((s) => {
        s.timelines[newTimeline.id] = newTimeline
        newNodes.forEach((n) => { s.nodes[n.id] = n })
      })
      return newTimeline
    },

    createConnection: async (data) => {
      const connection: Connection = {
        id: nanoid(),
        fromNodeId: data.fromNodeId!,
        toNodeId: data.toNodeId!,
        style: data.style ?? 'curved',
        type: data.type ?? 'arrow',
        ...data,
      }
      await connectionsDB.save(connection)
      set((s) => { s.connections[connection.id] = connection })
      return connection
    },

    deleteConnection: async (id) => {
      await connectionsDB.delete(id)
      set((s) => { delete s.connections[id] })
    },

    selectNode: (id, multi = false) => {
      set((s) => {
        if (multi) {
          if (s.selection.selectedNodeIds.has(id)) {
            s.selection.selectedNodeIds.delete(id)
          } else {
            s.selection.selectedNodeIds.add(id)
          }
        } else {
          s.selection.selectedNodeIds = new Set([id])
        }
      })
    },

    selectNodes: (ids) => set((s) => { s.selection.selectedNodeIds = new Set(ids) }),
    clearSelection: () => set((s) => { s.selection.selectedNodeIds = new Set() }),

    pushUndo: (action) => {
      set((s) => {
        if (s.isReplayingHistory) return
        s.undoStack.push(action)
        if (s.undoStack.length > 100) s.undoStack.shift()
        s.redoStack = []
      })
    },

    undo: async () => {
      const { undoStack } = get()
      if (!undoStack.length) return
      const action = undoStack[undoStack.length - 1]
      set((s) => { s.isReplayingHistory = true })
      try {
        if (action.type === 'CREATE_NODE') {
          await nodesDB.delete(action.node.id)
          set((s) => { delete s.nodes[action.node.id]; s.isDirty = true })
        }
        if (action.type === 'DELETE_NODE') {
          await nodesDB.save(action.node)
          set((s) => { s.nodes[action.node.id] = action.node; s.isDirty = true })
        }
        if (action.type === 'UPDATE_NODE') {
          await nodesDB.save(action.before)
          set((s) => { s.nodes[action.before.id] = action.before; s.isDirty = true })
        }
        if (action.type === 'CREATE_CONNECTION') {
          await connectionsDB.delete(action.connection.id)
          set((s) => { delete s.connections[action.connection.id]; s.isDirty = true })
        }
        if (action.type === 'DELETE_CONNECTION') {
          await connectionsDB.save(action.connection)
          set((s) => { s.connections[action.connection.id] = action.connection; s.isDirty = true })
        }
        set((s) => { s.undoStack.pop(); s.redoStack.push(action) })
      } finally {
        set((s) => { s.isReplayingHistory = false })
      }
    },

    redo: async () => {
      const { redoStack } = get()
      if (!redoStack.length) return
      const action = redoStack[redoStack.length - 1]
      set((s) => { s.isReplayingHistory = true })
      try {
        if (action.type === 'CREATE_NODE') {
          await nodesDB.save(action.node)
          set((s) => { s.nodes[action.node.id] = action.node; s.isDirty = true })
        }
        if (action.type === 'DELETE_NODE') {
          await nodesDB.delete(action.node.id)
          set((s) => { delete s.nodes[action.node.id]; s.isDirty = true })
        }
        if (action.type === 'UPDATE_NODE') {
          await nodesDB.save(action.after)
          set((s) => { s.nodes[action.after.id] = action.after; s.isDirty = true })
        }
        if (action.type === 'CREATE_CONNECTION') {
          await connectionsDB.save(action.connection)
          set((s) => { s.connections[action.connection.id] = action.connection; s.isDirty = true })
        }
        if (action.type === 'DELETE_CONNECTION') {
          await connectionsDB.delete(action.connection.id)
          set((s) => { delete s.connections[action.connection.id]; s.isDirty = true })
        }
        set((s) => { s.redoStack.pop(); s.undoStack.push(action) })
      } finally {
        set((s) => { s.isReplayingHistory = false })
      }
    },
  })),
)
