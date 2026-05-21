'use client'
import { useRouter } from 'next/navigation'
import { ClipboardList, BookOpen, ChevronRight, Trophy } from 'lucide-react'

const CARDS = [
  {
    href: '/practice/full-exam',
    icon: Trophy,
    color: '#fbbf24',
    label: 'TOEIC Vollprüfung',
    sub: '120 Min · L+R Score',
    desc: 'Originalgetreue Simulation: 45 Min Listening + 75 Min Reading mit echtem Timer und separatem Score',
    badge: 'NEU',
  },
  {
    href: '/practice/mini-exam',
    icon: ClipboardList,
    color: '#6366f1',
    label: 'Mini-Prüfung',
    sub: '15 Min · 11 Fragen',
    desc: 'Simuliere eine echte TOEIC-Prüfungssituation im Kurzformat',
  },
  {
    href: '/guide',
    icon: BookOpen,
    color: '#04FF88',
    label: 'TOEIC Guide',
    sub: 'Format & Tipps',
    desc: 'Lerne den Aufbau des TOEIC-Tests kennen und lese Prüfungstipps',
  },
]

export default function TestSimulationPage() {
  const router = useRouter()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Prüfen</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Prüfungsbedingungen mit Timer — teste dein echtes Level</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CARDS.map(card => {
          const Icon = card.icon
          return (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '22px 24px', borderRadius: 14,
                border: '1.5px solid var(--card-border)',
                background: 'var(--card)', cursor: 'pointer',
                textAlign: 'left', width: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = card.color + '60')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: card.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{card.label}</p>
                  <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card-border)', padding: '2px 8px', borderRadius: 99 }}>
                    {card.sub}
                  </span>
                  {'badge' in card && card.badge && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', letterSpacing: '0.06em' }}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
