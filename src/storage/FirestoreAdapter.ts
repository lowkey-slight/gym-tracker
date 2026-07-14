import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { LiftSet } from '../types'
import type { StorageAdapter } from './StorageAdapter'

/**
 * Stores sets at users/{uid}/sets/{id}. Writes resolve immediately against the
 * local cache (never awaited to server ack), so the app stays snappy offline;
 * the SDK syncs in the background and onSnapshot keeps the UI consistent.
 */
export class FirestoreAdapter implements StorageAdapter {
  private col: CollectionReference

  constructor(uid: string) {
    this.col = collection(db, 'users', uid, 'sets')
  }

  async load(): Promise<LiftSet[]> {
    const snap = await getDocs(this.col)
    return snap.docs.map((d) => d.data() as LiftSet)
  }

  async saveSet(set: LiftSet): Promise<void> {
    void setDoc(doc(this.col, set.id), set).catch(reportWriteError)
  }

  async deleteSet(id: string): Promise<void> {
    void setDoc(doc(this.col, id), { deleted: true }, { merge: true }).catch(
      reportWriteError,
    )
  }

  async restoreSet(id: string): Promise<void> {
    void setDoc(doc(this.col, id), { deleted: false }, { merge: true }).catch(
      reportWriteError,
    )
  }

  async mergeSets(sets: LiftSet[]): Promise<void> {
    // Firestore batches cap at 500 operations.
    for (let i = 0; i < sets.length; i += 450) {
      const batch = writeBatch(db)
      for (const set of sets.slice(i, i + 450)) {
        batch.set(doc(this.col, set.id), set, { merge: true })
      }
      await batch.commit()
    }
  }

  subscribe(listener: (sets: LiftSet[]) => void): () => void {
    return onSnapshot(
      this.col,
      (snap) => listener(snap.docs.map((d) => d.data() as LiftSet)),
      reportWriteError,
    )
  }
}

function reportWriteError(err: unknown) {
  console.error('Firestore sync error:', err)
}
