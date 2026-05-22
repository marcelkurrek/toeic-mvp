'use client'
import { useState } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'

interface ExamGoalOption {
  id: string
  emoji: string
  title: string
  subtitle: string
  description: string
  examTypeHint?: string
  scoreFocused: boolean
}

const EXAM_GOALS: ExamGoalOption[] = [
  {
    id: 'APPLICATIONS',
    emoji: '🚀',
    title: 'Bessere Chancen bei Bewerbungen',
    subtitle: 'Lebenslauf stärker wirken lassen',
    description: 'Dein TOEIC-Zertifikat macht dich attraktiver für Arbeitgeber und erhöht deine Chancen zu Bewerbungsgesprächen eingeladen zu werden.',
    examTypeHint: 'Empfohlen: Listening & Reading',
    scoreFocused: true,
  },
  {
    id: 'CAREER',
    emoji: '💼',
    title: 'Karriere & Arbeit',
    subtitle: 'Job oder Beförderung',
    description: 'Verbessere deine Chancen auf einen neuen Job oder eine Beförderung durch bessere Englischkenntnisse in deinem Beruf.',
    examTypeHint: 'Empfohlen: Listening & Reading',
    scoreFocused: false,
  },
  {
    id: 'GLOBAL_TEAMS',
    emoji: '🌍',
    title: 'Internationales Arbeiten',
    subtitle: 'Mit Teams kommunizieren',
    description: 'Kommuniziere sicherer mit internationalen Kollegen, verstehe Meetings und Diskussionen, arbeite in global tätigen Unternehmen.',
    examTypeHint: 'Empfohlen: Full Certificate (alle 4 Bereiche)',
    scoreFocused: false,
  },
  {
    id: 'ACADEMICS',
    emoji: '🎓',
    title: 'Studium',
    subtitle: 'Hochschul-Zertifikat',
    description: 'Nutze dein TOEIC-Zertifikat als Nachweis deiner Englischkenntnisse bei Hochschulbewerbungen oder Auslandsprogrammen.',
    examTypeHint: 'Empfohlen: Full Certificate (balanced)',
    scoreFocused: true,
  },
  {
    id: 'SELF_IMPROVEMENT',
    emoji: '🧠',
    title: 'Englischkenntnisse',
    subtitle: 'Allgemein besser werden',
    description: 'Verbessere dein Hör- und Leseverständnis, verstehe Texte und Gespräche im Arbeitskontext besser, werde sicherer im Umgang mit Englisch.',
    examTypeHint: 'Flexibel: beliebiger Exam-Typ',
    scoreFocused: false,
  },
]

interface Props {
  onSelect: (goal: string) => void
  selected?: string
}

export function ExamGoalSelector({ onSelect, selected }: Props) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Warum machst du den TOEIC?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Dein Ziel hilft uns, den perfekten Trainingsplan für dich zu erstellen.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAM_GOALS.map((goal) => {
          const isSelected = selected === goal.id
          return (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              onMouseEnter={() => setHover(goal.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: 'var(--card)',
                border: isSelected
                  ? '2px solid var(--accent)'
                  : hover === goal.id
                    ? '1px solid var(--accent)'
                    : '1px solid var(--card-border)',
                borderRadius: 12,
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow:
                  isSelected
                    ? `0 0 0 3px rgba(79,70,229,0.1)`
                    : hover === goal.id
                      ? '0 2px 8px rgba(0,0,0,0.1)'
                      : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{goal.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {goal.title}
                    </p>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                    {goal.subtitle}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                    {goal.description}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, margin: 0 }}>
                    ✓ {goal.examTypeHint}
                  </p>
                </div>
                {isSelected && (
                  <ChevronRight size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 32, padding: '16px', borderRadius: 8, background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          💡 <strong>Tipp:</strong> Dein Ziel kann später jederzeit in den Einstellungen geändert werden.
          Das TOEIC-Training ist für alle Ziele gleich — wir passen nur die Schwerpunkte an.
        </p>
      </div>
    </div>
  )
}
