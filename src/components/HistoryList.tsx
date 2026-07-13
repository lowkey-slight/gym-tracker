import { useMemo } from 'react'
import type { LiftSet } from '../types'
import { formatDate } from '../lib/dates'

interface Props {
  sets: LiftSet[]
  onDelete(id: string): void
}

export function HistoryList({ sets, onDelete }: Props) {
  const groups = useMemo(() => {
    const byDate = new Map<string, LiftSet[]>()
    for (const set of sets) {
      const list = byDate.get(set.date) ?? []
      list.push(set)
      byDate.set(set.date, list)
    }
    return [...byDate.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, daySets]) => ({
        date,
        sets: daySets.sort((a, b) => b.createdAt - a.createdAt),
      }))
  }, [sets])

  if (sets.length === 0) {
    return (
      <p className="empty-state">
        No sets logged yet. Add your first lift on the Log tab.
      </p>
    )
  }

  return (
    <div className="history">
      {groups.map((group) => (
        <section key={group.date} className="day-group">
          <h2>{formatDate(group.date)}</h2>
          <ul>
            {group.sets.map((set) => (
              <li key={set.id} className="set-row">
                <div className="set-info">
                  <span className="set-exercise">{set.exercise}</span>
                  <span className="set-detail">
                    {set.weightKg} kg × {set.reps} ={' '}
                    {Math.round(set.weightKg * set.reps * 10) / 10} kg
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-delete"
                  aria-label={`Delete ${set.exercise} ${set.weightKg} kg × ${set.reps}`}
                  onClick={() => onDelete(set.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
