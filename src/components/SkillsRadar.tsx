'use client'

interface Skill { label: string; value: number; color: string; max?: number }

export default function SkillsRadar({ skills }: { skills: Skill[] }) {
  if (skills.length < 3) return null

  const size   = 200
  const cx     = size / 2
  const cy     = size / 2
  const radius = 80
  const n      = skills.length
  const levels = [0.25, 0.5, 0.75, 1.0]

  function point(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function polygon(values: number[]) {
    return values
      .map((v, i) => {
        const angle = (360 / n) * i
        const { x, y } = point(angle, v * radius)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  const axes = skills.map((_, i) => {
    const angle = (360 / n) * i
    const end   = point(angle, radius)
    return { x2: end.x, y2: end.y, angle }
  })

  const dataPolygon = polygon(skills.map(s => Math.max(0.05, s.value)))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: 180, height: 180, flexShrink: 0 }}>
        {/* Background rings */}
        {levels.map(l => (
          <polygon key={l}
            points={polygon(skills.map(() => l))}
            fill="none" stroke="var(--card-border)" strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axes.map((ax, i) => (
          <line key={i} x1={cx} y1={cy} x2={ax.x2} y2={ax.y2}
            stroke="var(--card-border)" strokeWidth="1" />
        ))}

        {/* Data */}
        <polygon points={dataPolygon} fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="1.5" />

        {/* Labels */}
        {skills.map((s, i) => {
          const angle = (360 / n) * i
          const { x, y } = point(angle, radius + 18)
          const anchor = Math.abs(angle % 360 - 180) < 10 ? 'middle' : x < cx ? 'end' : x > cx ? 'start' : 'middle'
          return (
            <text key={i} x={x} y={y} textAnchor={anchor}
              dominantBaseline="middle"
              style={{ fontSize: 9, fontFamily: 'inherit', fontWeight: 600 }}
              fill={s.color}>
              {s.label}
            </text>
          )
        })}

        {/* Value dots */}
        {skills.map((s, i) => {
          const angle = (360 / n) * i
          const v     = Math.max(0.05, s.value)
          const { x, y } = point(angle, v * radius)
          return <circle key={i} cx={x} cy={y} r="3" fill={s.color} />
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skills.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 'auto', color: s.value > 0 ? s.color : 'var(--muted)' }}>
              {s.value > 0 ? `${Math.round(s.value * 100)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
