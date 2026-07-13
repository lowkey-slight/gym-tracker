import { useState } from 'react'
import { todayLocalISO } from '../lib/dates'

interface Props {
  exercises: string[]
  onAdd(input: {
    exercise: string
    weightKg: number
    reps: number
    date: string
  }): void
}

export function LogForm({ exercises, onAdd }: Props) {
  const [exercise, setExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [date, setDate] = useState(todayLocalISO())
  const [saved, setSaved] = useState(false)

  const weightKg = parseFloat(weight)
  const repsNum = parseInt(reps, 10)
  const valid =
    exercise.trim() !== '' &&
    Number.isFinite(weightKg) &&
    weightKg > 0 &&
    Number.isInteger(repsNum) &&
    repsNum > 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onAdd({ exercise, weightKg, reps: repsNum, date })
    // Keep exercise/weight prefilled for fast multi-set entry.
    setReps('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <form className="log-form" onSubmit={submit}>
      <label>
        Exercise
        <input
          type="text"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="e.g. Bench Press"
          list="exercise-suggestions"
          autoCapitalize="words"
          required
        />
        <datalist id="exercise-suggestions">
          {exercises.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      {exercises.length > 0 && (
        <div className="chips" role="listbox" aria-label="Recent exercises">
          {exercises.slice(0, 6).map((name) => (
            <button
              key={name}
              type="button"
              className={`chip${name === exercise ? ' chip-active' : ''}`}
              onClick={() => setExercise(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="form-row">
        <label>
          Weight (kg)
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="60"
            required
          />
        </label>
        <label>
          Reps
          <input
            type="text"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8"
            required
          />
        </label>
      </div>

      <label>
        Date
        <input
          type="date"
          value={date}
          max={todayLocalISO()}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="btn-primary" disabled={!valid}>
        {saved ? 'Logged ✓' : 'Log set'}
      </button>
    </form>
  )
}
