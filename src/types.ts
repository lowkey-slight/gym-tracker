export interface LiftSet {
  id: string
  /** Display name as the user typed it, trimmed. Grouping is case-insensitive. */
  exercise: string
  weightKg: number
  reps: number
  /** Local calendar date "YYYY-MM-DD" — gym sessions are local-day events. */
  date: string
  /** Epoch ms, used for ordering and future cloud-sync merges. */
  createdAt: number
  /** Tombstone so deletions can sync to the cloud later. */
  deleted?: boolean
}

/** Case-insensitive key used to group sets belonging to the same exercise. */
export function exerciseKey(name: string): string {
  return name.trim().toLowerCase()
}
