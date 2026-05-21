'use client'

export interface ScorecardDimension {
  label: string
  score: number
  color: string
}

interface FeedbackScorecardProps {
  overall: number
  dimensions: ScorecardDimension[]
  feedback: string
  complete: boolean
  tip?: string | null
}

export default function FeedbackScorecard({ overall, dimensions, feedback, complete, tip }: FeedbackScorecardProps) {
  const overallColor = overall >= 75 ? 'var(--success)' : overall >= 55 ? '#fbbf24' : '#ef4444'

  return (
    <div>
      {/* Overall + feedback */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 62, height: 62, borderRadius: '50%', flexShrink: 0,
          background: overallColor + '18',
          border: `2.5px solid ${overallColor}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: overallColor, lineHeight: 1 }}>{overall}</span>
          <span style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>/ 100</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: complete ? 'var(--success)' : '#fbbf24' }}>
            {complete ? '✓ Gut gemacht!' : '→ Weiter üben'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.65 }}>{feedback}</p>
          {tip && (
            <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, fontWeight: 500 }}>
              💡 {tip}
            </p>
          )}
        </div>
      </div>

      {/* Dimension bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dimensions.map(d => {
          const dColor = d.score >= 75 ? d.color : d.score >= 50 ? '#fbbf24' : '#ef4444'
          return (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.02em' }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: dColor }}>{d.score}</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, background: dColor,
                  width: `${d.score}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
