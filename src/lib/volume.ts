import { exerciseKey, type LiftSet } from '../types'

export interface DayVolume {
  date: string
  volume: number
}

/**
 * Total volume (weight × reps summed over sets) per day for one exercise,
 * sorted by date ascending. Tombstoned sets are excluded by the caller.
 */
export function dailyVolume(sets: LiftSet[], exercise: string): DayVolume[] {
  const key = exerciseKey(exercise)
  const byDate = new Map<string, number>()
  for (const set of sets) {
    if (exerciseKey(set.exercise) !== key) continue
    byDate.set(set.date, (byDate.get(set.date) ?? 0) + set.weightKg * set.reps)
  }
  return [...byDate.entries()]
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Distinct exercises (latest-used first), using the most recent display name. */
export function distinctExercises(sets: LiftSet[]): string[] {
  const latest = new Map<string, { name: string; createdAt: number }>()
  for (const set of sets) {
    const key = exerciseKey(set.exercise)
    const current = latest.get(key)
    if (!current || set.createdAt > current.createdAt) {
      latest.set(key, { name: set.exercise.trim(), createdAt: set.createdAt })
    }
  }
  return [...latest.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((e) => e.name)
}
