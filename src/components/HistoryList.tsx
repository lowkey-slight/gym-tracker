import { useMemo, useState } from 'react'
import { exerciseKey, type LiftSet } from '../types'
import { formatDate } from '../lib/dates'

interface Props {
  sets: LiftSet[]
  onDelete(id: string): void
}

interface ExerciseGroup {
  key: string
  name: string
  sets: LiftSet[]
}

interface DayGroup {
  date: string
  exercises: ExerciseGroup[]
}

function groupSets(sets: LiftSet[]): DayGroup[] {
  const byDate = new Map<string, Map<string, ExerciseGroup>>()
  for (const set of sets) {
    let day = byDate.get(set.date)
    if (!day) {
      day = new Map()
      byDate.set(set.date, day)
    }
    const key = exerciseKey(set.exercise)
    let group = day.get(key)
    if (!group) {
      group = { key, name: set.exercise.trim(), sets: [] }
      day.set(key, group)
    }
    group.sets.push(set)
  }
  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, exercises]) => ({
      date,
      exercises: [...exercises.values()].map((g) => ({
        ...g,
        // Chronological so "Set 1" is the first one logged.
        sets: g.sets.sort((a, b) => a.createdAt - b.createdAt),
      })),
    }))
}

export function HistoryList({ sets, onDelete }: Props) {
  const groups = useMemo(() => groupSets(sets), [sets])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (sets.length === 0) {
    return (
      <p className="empty-state">
        No sets logged yet. Add your first lift on the Log tab.
      </p>
    )
  }

  return (
    <div className="history">
      {groups.map((day) => (
        <section key={day.date} className="day-group">
          <h2>{formatDate(day.date)}</h2>
          <div className="day-table">
            {day.exercises.map((ex) => {
              const id = `${day.date}|${ex.key}`
              const open = expanded.has(id)
              return (
                <div key={id} className="exercise-block">
                  <button
                    type="button"
                    className="exercise-toggle"
                    aria-expanded={open}
                    onClick={() => toggle(id)}
                  >
                    <span className="exercise-toggle-name">{ex.name}</span>
                    <span className="exercise-toggle-meta">
                      {ex.sets.length} {ex.sets.length === 1 ? 'set' : 'sets'}
                      <span className="exercise-toggle-arrow" aria-hidden>
                        {open ? '▾' : '▸'}
                      </span>
                    </span>
                  </button>
                  {open && (
                    <table className="sets-table">
                      <thead>
                        <tr>
                          <th>Set</th>
                          <th>Weight (kg)</th>
                          <th>Reps</th>
                          <th>
                            <span className="visually-hidden">Delete</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ex.sets.map((s, i) => (
                          <tr key={s.id}>
                            <td>{i + 1}</td>
                            <td>{s.weightKg}</td>
                            <td>{s.reps}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-delete"
                                aria-label={`Delete set ${i + 1} of ${ex.name}`}
                                onClick={() => onDelete(s.id)}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
