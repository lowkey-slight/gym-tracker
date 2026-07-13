import { useEffect, useMemo, useState } from 'react'
import type { LiftSet } from '../types'
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import type { StorageAdapter } from '../storage/StorageAdapter'

const adapter: StorageAdapter = new LocalStorageAdapter()

export function useLifts() {
  const [allSets, setAllSets] = useState<LiftSet[]>([])

  useEffect(() => {
    let cancelled = false
    adapter.load().then((sets) => {
      if (!cancelled) setAllSets(sets)
    })
    const unsubscribe = adapter.subscribe(setAllSets)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  // Everything the UI shows excludes tombstoned sets.
  const sets = useMemo(() => allSets.filter((s) => !s.deleted), [allSets])

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
    addSet,
    deleteSet: (id: string) => adapter.deleteSet(id),
    restoreSet: (id: string) => adapter.restoreSet(id),
    importSets: (incoming: LiftSet[]) => adapter.mergeSets(incoming),
    /** Full data including tombstones, for export/backup. */
    exportSets: () => adapter.load(),
  }
}
