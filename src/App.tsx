import { useEffect, useMemo, useRef, useState } from 'react'
import { useLifts } from './hooks/useLifts'
import { dailyVolume, distinctExercises } from './lib/volume'
import { LogForm } from './components/LogForm'
import { HistoryList } from './components/HistoryList'
import { ProgressChart } from './components/ProgressChart'
import { ExercisePicker } from './components/ExercisePicker'
import { SettingsSheet } from './components/SettingsSheet'

type Tab = 'log' | 'history' | 'progress'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'log', label: 'Log', icon: '➕' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'progress', label: 'Progress', icon: '📈' },
]

export default function App() {
  const {
    sets,
    user,
    addSet,
    deleteSet,
    restoreSet,
    importSets,
    exportSets,
    signIn,
    signOut,
  } = useLifts()
  const [tab, setTab] = useState<Tab>('log')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chartExercise, setChartExercise] = useState('')
  const [undoId, setUndoId] = useState<string | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)

  const exercises = useMemo(() => distinctExercises(sets), [sets])

  const lastSet = useMemo(
    () =>
      sets.length > 0
        ? sets.reduce((a, b) => (b.createdAt > a.createdAt ? b : a))
        : null,
    [sets],
  )

  // Keep the chart pointed at a real exercise as data changes.
  const selectedExercise =
    exercises.find((e) => e === chartExercise) ?? exercises[0] ?? ''
  const chartData = useMemo(
    () => (selectedExercise ? dailyVolume(sets, selectedExercise) : []),
    [sets, selectedExercise],
  )

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  function handleDelete(id: string) {
    deleteSet(id)
    setUndoId(id)
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setUndoId(null), 5000)
  }

  function handleUndo() {
    if (undoId) restoreSet(undoId)
    setUndoId(null)
    window.clearTimeout(undoTimer.current)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gym Tracker</h1>
        <button
          type="button"
          className="btn-icon"
          aria-label={user ? `Sync settings, signed in` : 'Sync settings'}
          onClick={() => setSettingsOpen(true)}
        >
          {user ? '☁️' : '⚙️'}
        </button>
      </header>

      <main className="app-main">
        {tab === 'log' && (
          <LogForm exercises={exercises} lastSet={lastSet} onAdd={addSet} />
        )}
        {tab === 'history' && (
          <HistoryList sets={sets} onDelete={handleDelete} />
        )}
        {tab === 'progress' && (
          <>
            <ExercisePicker
              exercises={exercises}
              selected={selectedExercise}
              onSelect={setChartExercise}
            />
            {exercises.length === 0 ? (
              <p className="empty-state">
                Log some sets first — your progress will show up here.
              </p>
            ) : (
              <ProgressChart data={chartData} exercise={selectedExercise} />
            )}
          </>
        )}
      </main>

      {undoId && (
        <div className="snackbar" role="status">
          Set deleted
          <button type="button" onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' tab-active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {settingsOpen && (
        <SettingsSheet
          user={user}
          onSignIn={signIn}
          onSignOut={signOut}
          onExport={exportSets}
          onImport={importSets}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
