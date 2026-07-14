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

export interface ExerciseStats {
  name: string
  /** Distinct days this exercise was logged. */
  sessions: number
  totalSets: number
  totalReps: number
}

/** Lifetime per-exercise stats, most-trained (by sets) first. */
export function exerciseStats(sets: LiftSet[]): ExerciseStats[] {
  const byKey = new Map<
    string,
    {
      name: string
      latest: number
      days: Set<string>
      totalSets: number
      totalReps: number
    }
  >()
  for (const set of sets) {
    const key = exerciseKey(set.exercise)
    let entry = byKey.get(key)
    if (!entry) {
      entry = { name: set.exercise.trim(), latest: 0, days: new Set(), totalSets: 0, totalReps: 0 }
      byKey.set(key, entry)
    }
    if (set.createdAt > entry.latest) {
      entry.latest = set.createdAt
      entry.name = set.exercise.trim()
    }
    entry.days.add(set.date)
    entry.totalSets += 1
    entry.totalReps += set.reps
  }
  return [...byKey.values()]
    .map((e) => ({
      name: e.name,
      sessions: e.days.size,
      totalSets: e.totalSets,
      totalReps: e.totalReps,
    }))
    .sort((a, b) => b.totalSets - a.totalSets || b.sessions - a.sessions)
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
