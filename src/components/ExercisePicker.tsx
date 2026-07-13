interface Props {
  exercises: string[]
  selected: string
  onSelect(name: string): void
}

export function ExercisePicker({ exercises, selected, onSelect }: Props) {
  if (exercises.length === 0) return null
  return (
    <label className="exercise-picker">
      Exercise
      <select value={selected} onChange={(e) => onSelect(e.target.value)}>
        {exercises.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
