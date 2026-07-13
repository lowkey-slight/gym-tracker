import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayVolume } from '../lib/volume'
import { formatDate, formatDateShort } from '../lib/dates'

interface Props {
  data: DayVolume[]
  exercise: string
}

export function ProgressChart({ data, exercise }: Props) {
  if (data.length < 2) {
    return (
      <p className="empty-state">
        {data.length === 0
          ? 'No data for this exercise yet.'
          : 'Log this exercise on at least two days to see a trend.'}
      </p>
    )
  }

  return (
    <div className="chart-card">
      <h2>{exercise} — daily volume (kg)</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            width={48}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <Tooltip
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(value) => [
              `${Number(value).toLocaleString()} kg`,
              'Volume',
            ]}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="var(--accent)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'var(--accent)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
