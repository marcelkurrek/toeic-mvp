'use client'
import { CheckCircle2 } from 'lucide-react'

interface ExamTypeOption {
  id: string
  emoji: string
  title: string
  subtitle: string
  description: string
}

const EXAM_TYPES: ExamTypeOption[] = [
  {
    id: 'LISTENING_READING',
    emoji: '🎧',
    title: 'Listening + Reading',
    subtitle: 'Standard TOEIC (L&R)',
    description:
      'Der Fokus liegt auf Hörverstehen und Leseverständnis. Du trainierst, englische Gespräche, Meetings und Geschäftsdokumente zu verstehen. Dies ist der Standard TOEIC Test.',
  },
  {
    id: 'SPEAKING_WRITING',
    emoji: '🎤',
    title: 'Speaking + Writing',
    subtitle: 'Mündlich & schriftlich',
    description:
      'Der Fokus liegt auf aktiver Kommunikation: Du lernst, auf Englisch zu sprechen und zu schreiben. Perfekt wenn du International präsentieren, E-Mails schreiben oder Diskussionen führen musst.',
  },
  {
    id: 'FULL_CERTIFICATE',
    emoji: '🎯',
    title: 'Alle 4 Bereiche',
    subtitle: 'Full Certificate (L, R, S, W)',
    description:
      'Du trainierst alle 4 Fähigkeiten: Hören, Lesen, Sprechen und Schreiben. Das vollständigste TOEIC Zertifikat — ideal wenn du alle Seiten des Englischen beherrschen willst.',
  },
]

interface Props {
  onSelect: (examType: string) => void
  selected?: string
}

export function OnboardingExamTypeSelector({ onSelect, selected }: Props) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Welche Bereiche willst du trainieren?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Wähle den Fokus für dein TOEIC Training. Du kannst dies später ändern.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAM_TYPES.map((type) => {
          const isSelected = selected === type.id
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
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
                <span style={{ fontSize: 40, flexShrink: 0 }}>{type.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {type.title}
                    </p>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 8px 0' }}>
                    {type.subtitle}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 32, padding: '16px', borderRadius: 8, background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          💡 <strong>Tipp:</strong> Die meisten User wählen Listening + Reading (Standard TOEIC).
          Du kannst diese Wahl später in den Einstellungen ändern.
        </p>
      </div>
    </div>
  )
}
