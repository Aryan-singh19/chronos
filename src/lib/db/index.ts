import { openDB, type IDBPDatabase } from 'idb'
import type {
  Project,
  Timeline,
  TimelineNode,
  Connection,
  VersionSnapshot,
  AppSettings,
  ID,
} from '@/types'

const DB_NAME = 'chronos-db'
const DB_VERSION = 1

export type ChronosDB = IDBPDatabase<{
  projects: { key: ID; value: Project; indexes: { 'by-updated': number } }
  timelines: { key: ID; value: Timeline; indexes: { 'by-project': ID; 'by-updated': number } }
  nodes: {
    key: ID
    value: TimelineNode
    indexes: { 'by-timeline': ID; 'by-date': number; 'by-status': string }
  }
  connections: { key: ID; value: Connection; indexes: { 'by-timeline': ID } }
  snapshots: { key: ID; value: VersionSnapshot; indexes: { 'by-timeline': ID } }
  settings: { key: string; value: AppSettings }
}>

let dbInstance: ChronosDB | null = null

export async function getDB(): Promise<ChronosDB> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<{
    projects: { key: ID; value: Project; indexes: { 'by-updated': number } }
    timelines: { key: ID; value: Timeline; indexes: { 'by-project': ID; 'by-updated': number } }
    nodes: {
      key: ID
      value: TimelineNode
      indexes: { 'by-timeline': ID; 'by-date': number; 'by-status': string }
    }
    connections: { key: ID; value: Connection; indexes: { 'by-timeline': ID } }
    snapshots: { key: ID; value: VersionSnapshot; indexes: { 'by-timeline': ID } }
    settings: { key: string; value: AppSettings }
  }>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Projects
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
      projectStore.createIndex('by-updated', 'updatedAt')

      // Timelines
      const timelineStore = db.createObjectStore('timelines', { keyPath: 'id' })
      timelineStore.createIndex('by-project', 'projectId')
      timelineStore.createIndex('by-updated', 'updatedAt')

      // Nodes
      const nodeStore = db.createObjectStore('nodes', { keyPath: 'id' })
      nodeStore.createIndex('by-timeline', 'timelineId')
      nodeStore.createIndex('by-date', 'date')
      nodeStore.createIndex('by-status', 'status')

      // Connections
      const connStore = db.createObjectStore('connections', { keyPath: 'id' })
      connStore.createIndex('by-timeline', 'timelineId')

      // Snapshots
      const snapStore = db.createObjectStore('snapshots', { keyPath: 'id' })
      snapStore.createIndex('by-timeline', 'timelineId')

      // Settings
      db.createObjectStore('settings', { keyPath: 'id' } as never)
    },
  })

  return dbInstance
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsDB = {
  async getAll(): Promise<Project[]> {
    const db = await getDB()
    return db.getAll('projects')
  },
  async get(id: ID): Promise<Project | undefined> {
    const db = await getDB()
    return db.get('projects', id)
  },
  async save(project: Project): Promise<void> {
    const db = await getDB()
    await db.put('projects', project)
  },
  async delete(id: ID): Promise<void> {
    const db = await getDB()
    await db.delete('projects', id)
  },
}

// ─── Timelines ────────────────────────────────────────────────────────────────

export const timelinesDB = {
  async getAll(): Promise<Timeline[]> {
    const db = await getDB()
    return db.getAll('timelines')
  },
  async getByProject(projectId: ID): Promise<Timeline[]> {
    const db = await getDB()
    return db.getAllFromIndex('timelines', 'by-project', projectId)
  },
  async get(id: ID): Promise<Timeline | undefined> {
    const db = await getDB()
    return db.get('timelines', id)
  },
  async save(timeline: Timeline): Promise<void> {
    const db = await getDB()
    await db.put('timelines', timeline)
  },
  async delete(id: ID): Promise<void> {
    const db = await getDB()
    await db.delete('timelines', id)
  },
}

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const nodesDB = {
  async getByTimeline(timelineId: ID): Promise<TimelineNode[]> {
    const db = await getDB()
    return db.getAllFromIndex('nodes', 'by-timeline', timelineId)
  },
  async get(id: ID): Promise<TimelineNode | undefined> {
    const db = await getDB()
    return db.get('nodes', id)
  },
  async save(node: TimelineNode): Promise<void> {
    const db = await getDB()
    await db.put('nodes', node)
  },
  async saveMany(nodes: TimelineNode[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('nodes', 'readwrite')
    await Promise.all([...nodes.map((n) => tx.store.put(n)), tx.done])
  },
  async delete(id: ID): Promise<void> {
    const db = await getDB()
    await db.delete('nodes', id)
  },
  async deleteMany(ids: ID[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('nodes', 'readwrite')
    await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done])
  },
  async getAll(): Promise<TimelineNode[]> {
    const db = await getDB()
    return db.getAll('nodes')
  },
}

// ─── Connections ──────────────────────────────────────────────────────────────

export const connectionsDB = {
  async getByTimeline(timelineId: ID): Promise<Connection[]> {
    const db = await getDB()
    return db.getAllFromIndex('connections', 'by-timeline', timelineId)
  },
  async save(connection: Connection): Promise<void> {
    const db = await getDB()
    await db.put('connections', connection)
  },
  async delete(id: ID): Promise<void> {
    const db = await getDB()
    await db.delete('connections', id)
  },
}

// ─── Snapshots ────────────────────────────────────────────────────────────────

export const snapshotsDB = {
  async getByTimeline(timelineId: ID): Promise<VersionSnapshot[]> {
    const db = await getDB()
    return db.getAllFromIndex('snapshots', 'by-timeline', timelineId)
  },
  async save(snapshot: VersionSnapshot): Promise<void> {
    const db = await getDB()
    await db.put('snapshots', snapshot)
  },
  async delete(id: ID): Promise<void> {
    const db = await getDB()
    await db.delete('snapshots', id)
  },
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsDB = {
  async get(): Promise<AppSettings | undefined> {
    const db = await getDB()
    return db.get('settings', 'app') as Promise<AppSettings | undefined>
  },
  async save(settings: AppSettings): Promise<void> {
    const db = await getDB()
    await db.put('settings', { ...settings, id: 'app' } as never)
  },
}

// ─── DB Size Estimate ─────────────────────────────────────────────────────────

export async function estimateDBSize(): Promise<number> {
  if (!navigator.storage?.estimate) return 0
  const estimate = await navigator.storage.estimate()
  return (estimate.usage ?? 0) / (1024 * 1024) // MB
}
