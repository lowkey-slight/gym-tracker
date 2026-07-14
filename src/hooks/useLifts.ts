import { useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import type { LiftSet } from '../types'
import { distinctExercises } from '../lib/volume'
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import { FirestoreAdapter } from '../storage/FirestoreAdapter'
import type { StorageAdapter } from '../storage/StorageAdapter'

const localAdapter = new LocalStorageAdapter()

export function useLifts() {
  const [user, setUser] = useState<User | null>(() => auth.currentUser)
  const [allSets, setAllSets] = useState<LiftSet[]>([])

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  // Signed in -> Firestore (with its own offline cache); signed out -> localStorage.
  const adapter: StorageAdapter = useMemo(
    () => (user ? new FirestoreAdapter(user.uid) : localAdapter),
    [user],
  )

  useEffect(() => {
    let cancelled = false
    setAllSets([])
    adapter
      .load()
      .then((sets) => {
        if (!cancelled) setAllSets(sets)
      })
      .catch((err) => console.error('Failed to load sets:', err))
    const unsubscribe = adapter.subscribe(setAllSets)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [adapter])

  // On sign-in, fold any device-local sets into the cloud. Union-by-id makes
  // this idempotent, so re-running after an interrupted attempt is harmless.
  useEffect(() => {
    if (!user) return
    const migratedFlag = `gym-lifts/migrated/${user.uid}`
    if (localStorage.getItem(migratedFlag)) return
    const cloud = new FirestoreAdapter(user.uid)
    localAdapter
      .load()
      .then(async (local) => {
        if (local.length > 0) await cloud.mergeSets(local)
        localStorage.setItem(migratedFlag, '1')
      })
      .catch((err) => console.error('Migration to cloud failed:', err))
  }, [user])

  const sets = useMemo(() => allSets.filter((s) => !s.deleted), [allSets])

  // Every exercise ever typed, even if all its sets were later deleted —
  // tombstones are kept, so the library never forgets a name.
  const exerciseLibrary = useMemo(() => distinctExercises(allSets), [allSets])

  async function addSet(input: {
    exercise: string
    weightKg: number
    reps: number
    date: string
  }) {
    await adapter.saveSet({
      id: crypto.randomUUID(),
      exercise: input.exercise.trim(),
      weightKg: input.weightKg,
      reps: input.reps,
      date: input.date,
      createdAt: Date.now(),
    })
  }

  return {
    sets,
    exerciseLibrary,
    user,
    addSet,
    deleteSet: (id: string) => adapter.deleteSet(id),
    restoreSet: (id: string) => adapter.restoreSet(id),
    importSets: (incoming: LiftSet[]) => adapter.mergeSets(incoming),
    /** Full data including tombstones, for export/backup. */
    exportSets: () => adapter.load(),
    signIn: () => signInWithPopup(auth, googleProvider),
    signOut: () => firebaseSignOut(auth),
  }
}
