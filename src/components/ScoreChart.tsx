'use client'

interface DataPoint { date: string; pct: number; label: string }

export default function ScoreChart({ data }: { data: DataPoint[] }) {
  if (data.length < 2) {
    return (
      <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Mindestens 2 abgeschlossene Sitzungen erforderlich
      </div>
    )
  }

  const W = 560
  const H = 140
  const PAD = { top: 16, right: 16, bottom: 28, left: 32 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const maxPct = Math.min(100, Math.max(...data.map(d => d.pct)) + 10)
  const minPct = Math.max(0, Math.min(...data.map(d => d.pct)) - 10)
  const range  = maxPct - minPct || 10

  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * innerW
  const yOf = (pct: number) => PAD.top + innerH - ((pct - minPct) / range) * innerH

  const polyline = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.pct).toFixed(1)}`).join(' ')
  const area     = [
    `M ${xOf(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
    ...data.map((d, i) => `L ${xOf(i).toFixed(1)} ${yOf(d.pct).toFixed(1)}`),
    `L ${xOf(data.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
    'Z',
  ].join(' ')

  const ticks = [minPct, Math.round((minPct + maxPct) / 2), maxPct]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {ticks.map(tick => {
        const y = yOf(tick)
        return (
          <g key={tick}>
            <line x1={PAD.left - 4} y1={y} x2={PAD.left + innerW} y2={y}
              stroke="var(--card-border)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end"
              style={{ fontSize: 9, fill: 'var(--muted)', fontFamily: 'inherit' }}>
              {tick}%
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={area} fill="url(#chartGrad)" />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points + x-labels */}
      {data.map((d, i) => {
        const x = xOf(i)
        const y = yOf(d.pct)
        const showLabel = data.length <= 10 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="var(--accent)" />
            {showLabel && (
              <text x={x} y={H - 4} textAnchor="middle"
                style={{ fontSize: 8, fill: 'var(--muted)', fontFamily: 'inherit' }}>
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
