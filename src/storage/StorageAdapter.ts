import type { LiftSet } from '../types'

/**
 * Persistence boundary. Phase A: LocalStorageAdapter. Phase B: FirestoreAdapter
 * implements the same interface so the rest of the app doesn't change.
 */
export interface StorageAdapter {
  /** All sets, including tombstoned ones. */
  load(): Promise<LiftSet[]>
  /** Insert or update a set by id. */
  saveSet(set: LiftSet): Promise<void>
  /** Mark a set deleted (tombstone), keeping it for sync. */
  deleteSet(id: string): Promise<void>
  /** Clear a tombstone (undo). */
  restoreSet(id: string): Promise<void>
  /** Merge external sets by id (import). Incoming records win on conflict. */
  mergeSets(sets: LiftSet[]): Promise<void>
  /** Notified with the full set list after any change. Returns unsubscribe. */
  subscribe(listener: (sets: LiftSet[]) => void): () => void
}
