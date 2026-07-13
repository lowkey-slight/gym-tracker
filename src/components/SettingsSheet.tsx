import { useRef, useState } from 'react'
import type { LiftSet } from '../types'

interface Props {
  onExport(): Promise<LiftSet[]>
  onImport(sets: LiftSet[]): void
  onClose(): void
}

function isValidSet(value: unknown): value is LiftSet {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.exercise === 'string' &&
    typeof s.weightKg === 'number' &&
    typeof s.reps === 'number' &&
    typeof s.date === 'string' &&
    typeof s.createdAt === 'number'
  )
}

export function SettingsSheet({ onExport, onImport, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  async function exportData() {
    const sets = await onExport()
    const blob = new Blob([JSON.stringify({ sets }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-lifts-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage(`Exported ${sets.length} sets.`)
  }

  function importFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { sets?: unknown }
        const sets = Array.isArray(parsed.sets)
          ? parsed.sets.filter(isValidSet)
          : []
        if (sets.length === 0) {
          setMessage('No valid sets found in that file.')
          return
        }
        onImport(sets)
        setMessage(`Imported ${sets.length} sets.`)
      } catch {
        setMessage("Couldn't read that file — is it a Gym Tracker export?")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Backup</h2>
        <p className="sheet-hint">
          Data lives in this browser. Export a JSON backup, or import one from
          another device.
        </p>
        <div className="sheet-actions">
          <button type="button" className="btn-primary" onClick={exportData}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInput.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importFile(file)
              e.target.value = ''
            }}
          />
        </div>
        {message && <p className="sheet-message">{message}</p>}
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
