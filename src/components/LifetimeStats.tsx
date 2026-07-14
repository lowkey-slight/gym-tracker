import type { ExerciseStats } from '../lib/volume'

interface Props {
  stats: ExerciseStats[]
}

export function LifetimeStats({ stats }: Props) {
  if (stats.length === 0) return null
  return (
    <section className="stats-card">
      <h2>Lifetime stats</h2>
      <ul>
        {stats.map((s, i) => (
          <li key={s.name} className="stats-row">
            <span className="stats-name">
              {i === 0 && stats.length > 1 && (
                <span className="stats-trophy" title="Most trained">
                  🏆{' '}
                </span>
              )}
              {s.name}
            </span>
            <span className="stats-detail">
              {s.sessions} {s.sessions === 1 ? 'session' : 'sessions'} ·{' '}
              {s.totalSets} {s.totalSets === 1 ? 'set' : 'sets'} ·{' '}
              {s.totalReps} reps
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
