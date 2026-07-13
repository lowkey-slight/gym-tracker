import type { LiftSet } from '../types'
import type { StorageAdapter } from './StorageAdapter'

const STORAGE_KEY = 'gym-lifts/v1'

interface StoreShape {
  sets: LiftSet[]
}

function readStore(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { sets: [] }
    const parsed = JSON.parse(raw) as StoreShape
    if (!Array.isArray(parsed.sets)) return { sets: [] }
    return parsed
  } catch {
    return { sets: [] }
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private listeners = new Set<(sets: LiftSet[]) => void>()

  constructor() {
    // Keep multiple open tabs in sync.
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) this.notify()
    })
  }

  private write(sets: LiftSet[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sets }))
    this.notify()
  }

  private notify() {
    const { sets } = readStore()
    for (const listener of this.listeners) listener(sets)
  }

  async load(): Promise<LiftSet[]> {
    return readStore().sets
  }

  async saveSet(set: LiftSet): Promise<void> {
    const sets = readStore().sets.filter((s) => s.id !== set.id)
    sets.push(set)
    this.write(sets)
  }

  async deleteSet(id: string): Promise<void> {
    this.write(
      readStore().sets.map((s) => (s.id === id ? { ...s, deleted: true } : s)),
    )
  }

  async restoreSet(id: string): Promise<void> {
    this.write(
      readStore().sets.map((s) => (s.id === id ? { ...s, deleted: false } : s)),
    )
  }

  async mergeSets(incoming: LiftSet[]): Promise<void> {
    const byId = new Map(readStore().sets.map((s) => [s.id, s]))
    for (const set of incoming) byId.set(set.id, set)
    this.write([...byId.values()])
  }

  subscribe(listener: (sets: LiftSet[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
