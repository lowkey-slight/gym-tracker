import { useMemo, useState } from 'react'
import { todayLocalISO } from '../lib/dates'
import { exerciseKey, type LiftSet } from '../types'

interface Props {
  exercises: string[]
  sets: LiftSet[]
  lastSet: LiftSet | null
  onAdd(input: {
    exercise: string
    weightKg: number
    reps: number
    date: string
  }): void
}

export function LogForm({ exercises, sets, lastSet, onAdd }: Props) {
  const [exercise, setExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [date, setDate] = useState(todayLocalISO())
  const [saved, setSaved] = useState(false)
  const [repeatDismissed, setRepeatDismissed] = useState(false)

  // Offer to repeat the last logged set, but only while the form is untouched.
  const formPristine = exercise === '' && weight === '' && reps === ''
  const showRepeatPrompt = lastSet !== null && !repeatDismissed && formPristine

  // Sets already logged for this exercise on the selected date — the
  // "where am I in this workout" strip between sets.
  const sessionSets = useMemo(() => {
    const key = exerciseKey(exercise)
    if (key === '') return []
    return sets
      .filter((s) => s.date === date && exerciseKey(s.exercise) === key)
      .sort((a, b) => a.createdAt - b.createdAt)
  }, [sets, exercise, date])

  function repeatLastSet() {
    if (!lastSet) return
    setExercise(lastSet.exercise)
    setWeight(String(lastSet.weightKg))
    setReps(String(lastSet.reps))
    setRepeatDismissed(true)
  }

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
    // Everything stays prefilled: logging the next identical set is one tap,
    // and adjusting weight or reps between sets is a single edit.
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <form className="log-form" onSubmit={submit}>
      {showRepeatPrompt && (
        <div className="repeat-card" role="group" aria-label="Repeat last set">
          <p>
            Repeat your last set?
            <br />
            <strong>{lastSet.exercise}</strong> — {lastSet.weightKg} kg ×{' '}
            {lastSet.reps}
          </p>
          <div className="repeat-actions">
            <button type="button" className="btn-primary" onClick={repeatLastSet}>
              Repeat it
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setRepeatDismissed(true)}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}
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
        {saved
          ? 'Logged ✓'
          : sessionSets.length > 0
            ? `Log set ${sessionSets.length + 1}`
            : 'Log set'}
      </button>

      {sessionSets.length > 0 && (
        <div className="session-strip" aria-label="Sets logged this session">
          <span className="session-label">
            {exercise.trim()} today · {sessionSets.length}{' '}
            {sessionSets.length === 1 ? 'set' : 'sets'}
          </span>
          <div className="session-chips">
            {sessionSets.map((s, i) => (
              <span key={s.id} className="session-chip">
                {i + 1}: {s.weightKg} kg × {s.reps}
              </span>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
