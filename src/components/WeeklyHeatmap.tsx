'use client'

interface Props {
  sessionDates: string[] // ISO date strings
}

function getDayLabel(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function WeeklyHeatmap({ sessionDates }: Props) {
  // Build a map: date string → count
  const counts: Record<string, number> = {}
  for (const d of sessionDates) {
    const day = d.slice(0, 10)
    counts[day] = (counts[day] ?? 0) + 1
  }

  // Last 28 days (4 weeks), newest on the right
  const days = Array.from({ length: 28 }, (_, i) => getDayLabel(27 - i))
  const weeks: string[][] = []
  for (let w = 0; w < 4; w++) weeks.push(days.slice(w * 7, w * 7 + 7))

  const max = Math.max(1, ...Object.values(counts))

  function cellColor(dateStr: string) {
    const c = counts[dateStr] ?? 0
    if (c === 0) return 'var(--card-border)'
    const intensity = Math.min(1, c / max)
    if (intensity < 0.33) return 'rgba(34,211,238,0.35)'
    if (intensity < 0.66) return 'rgba(34,211,238,0.6)'
    return 'rgba(34,211,238,0.9)'
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ width: 28, textAlign: 'center', fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', gap: 6 }}>
            {week.map(dateStr => {
              const count = counts[dateStr] ?? 0
              const isToday = dateStr === today
              return (
                <div
                  key={dateStr}
                  title={`${dateStr}: ${count} Sitzung${count !== 1 ? 'en' : ''}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: cellColor(dateStr),
                    border: isToday ? '2px solid var(--accent)' : '1px solid transparent',
                    transition: 'background 0.2s',
                    cursor: 'default',
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>weniger</span>
        {['var(--card-border)', 'rgba(34,211,238,0.35)', 'rgba(34,211,238,0.6)', 'rgba(34,211,238,0.9)'].map(c => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>mehr</span>
      </div>
    </div>
  )
}
