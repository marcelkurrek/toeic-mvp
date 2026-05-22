'use client'
import { CheckCircle2 } from 'lucide-react'

interface UseCaseOption {
  id: string
  emoji: string
  title: string
  subtitle: string
  description: string
  scoreFocused: boolean
}

const USE_CASES: UseCaseOption[] = [
  {
    id: 'CAREER',
    emoji: '💼',
    title: 'Karriere & Job',
    subtitle: 'Besser im Job oder bessere Bewerbungschancen',
    description:
      'Du möchtest entweder bessere Performance in deinem aktuellen Job erreichen oder bessere Chancen bei Bewerbungen haben. Du willst Meetings verstehen, mit Kollegen kommunizieren, englische Dokumente lesen, oder dich für einen besseren Job qualifizieren. Dein Fokus: Skill-Verbesserung in Listening & Reading für Business-Kontext.',
    scoreFocused: false,
  },
  {
    id: 'ABROAD',
    emoji: '🌍',
    title: 'Im Ausland arbeiten',
    subtitle: 'Arbeiten im Ausland, Umzug, neue Chancen',
    description:
      'Du möchtest im Ausland arbeiten — sei es in Australien, Kanada, den USA oder anderen Ländern. Du brauchst starkes Englisch für Work Visa, internationale Jobsuche und um mit deinen neuen Kollegen zu kommunizieren. Dein Fokus: Alle Skills trainieren (Listening, Reading, Speaking, Writing).',
    scoreFocused: false,
  },
  {
    id: 'ACADEMICS',
    emoji: '🎓',
    title: 'Universität/Studium',
    subtitle: 'Master, Austausch, Hochschul-Zertifikat',
    description:
      'Du möchtest einen Master machen (im In- oder Ausland), an einem Austauschprogramm teilnehmen, oder an einer englischsprachigen Universität studieren. TOEIC zeigt Universitäten deine Englischkenntnisse und eröffnet dir internationale Möglichkeiten. Dein Fokus: Balanced Training in allen Bereichen.',
    scoreFocused: false,
  },
  {
    id: 'SELF_IMPROVEMENT',
    emoji: '🧠',
    title: 'Englisch allgemein',
    subtitle: 'Persönlich besser werden, mehr Sicherheit',
    description:
      'Du möchtest einfach besser Englisch verstehen und sprechen — ohne konkretes Zertifikat-Ziel. Du willst Netflix ohne Untertitel schauen, selbstbewusster mit internationalen Freunden sprechen, oder dich im Alltag sicherer fühlen. Dein Fokus: Was immer du verbessern willst — völlig flexibel.',
    scoreFocused: false,
  },
]

interface Props {
  onSelect: (useCase: string) => void
  selected?: string
}

export function OnboardingUseCaseSelector({ onSelect, selected }: Props) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Warum trainierst du Englisch?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Wähle das Ziel, das am besten zu dir passt. Das hilft uns, deinen Trainingsplan anzupassen.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {USE_CASES.map((useCase) => {
          const isSelected = selected === useCase.id
          return (
            <button
              key={useCase.id}
              onClick={() => onSelect(useCase.id)}
              style={{
                background: 'var(--card)',
                border: isSelected ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                borderRadius: 12,
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontSize: 40, flexShrink: 0 }}>{useCase.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {useCase.title}
                    </p>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                    {useCase.subtitle}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                    {useCase.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 32, padding: '16px', borderRadius: 8, background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          💡 <strong>Wichtig:</strong> Dein Ziel bestimmt, wie wir dein Training personalisieren — es ändert nicht den TOEIC
          Test selbst, sondern nur deinen Trainings-Schwerpunkt.
        </p>
      </div>
    </div>
  )
}
