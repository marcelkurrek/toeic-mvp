'use client'
import Link from 'next/link'

interface PartCardProps {
  part: string
  href: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
  subtle: string
  info: { label: string; part: string; desc: string }
  pct: number | null
  prog: { accuracy: number; sampleSize: number } | null | undefined
  questionsAnswered: string
}

export default function PartCard({ part, href, icon: Icon, color, subtle, info, pct, prog, questionsAnswered }: PartCardProps) {
  return (
    <Link key={part} href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ padding: '20px', height: '100%', transition: 'border-color 0.15s', cursor: 'pointer', borderColor: 'var(--card-border)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} style={{ color }} />
          </div>
          {pct !== null && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: pct >= 80 ? 'rgba(74,222,128,0.15)' : pct >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)', color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)' }}>{pct}%</span>
          )}
        </div>
        <p className="font-semibold text-sm" style={{ marginBottom: 2 }}>{info.label}</p>
        <p style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' }}>{info.part}</p>
        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>{info.desc}</p>
        {prog ? (
          <>
            <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: color, width: `${prog.accuracy * 100}%` }} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)' }}>{prog.sampleSize} {questionsAnswered}</p>
          </>
        ) : null}
      </div>
    </Link>
  )
}
