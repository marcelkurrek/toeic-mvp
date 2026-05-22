'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, BarChart3, Zap } from 'lucide-react'

interface SessionSummary {
  accuracy: number
  errorPercentage: number
  totalQuestions: number
  totalCorrect: number
  errorsByType: Record<string, number>
  topErrors: Array<{ type: string; count: number }>
  avgTimeSec: number
  speedTarget: number
  speedFeedback: string
  generatedAt: string
}

interface Props {
  sessionId: string
  totalQuestions: number
  totalCorrect: number
  durationSec?: number
}

const DISTRACTOR_NAMES: Record<string, { label: string; icon: string; description: string }> = {
  SOUND_ALIKE: {
    label: '🔊 Sound-alike Trap',
    icon: '🔊',
    description: 'Ähnlich klingende Wörter verwechselt (z.B. "hired" vs. "tired")',
  },
  HOMONYM: {
    label: '📚 Homonym Trap',
    icon: '📚',
    description: 'Gleiche Aussprache, andere Bedeutung (z.B. "hear" vs. "here")',
  },
  RELATED_WORD: {
    label: '🎯 Related-word Trap',
    icon: '🎯',
    description: 'Semantisch verwandt aber falsch (z.B. "meeting" statt "conference")',
  },
  OMIT_NECESSARY: {
    label: '⚠️ Omit necessary word',
    icon: '⚠️',
    description: 'Ein wichtiges Wort vergessen oder übersehen',
  },
  ALTER_WORD_ORDER: {
    label: '🔄 Alter word order',
    icon: '🔄',
    description: 'Richtige Wörter, falsche Reihenfolge oder Grammatik',
  },
  OTHER: {
    label: '❓ Sonstiges',
    icon: '❓',
    description: 'Andere Fehlertypen',
  },
}

export function SessionEndSummary({ sessionId, totalQuestions, totalCorrect, durationSec }: Props) {
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateSummary = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/summary`, {
          method: 'POST',
        })
        if (!res.ok) throw new Error('Failed to generate summary')
        const data = await res.json()
        setSummary(data.sessionSummary)
      } catch (err) {
        console.error('Error generating summary:', err)
        setError('Fehleranalyse konnte nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    generateSummary()
  }, [sessionId])

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Fehleranalyse wird geladen...</p>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
        <p style={{ color: '#ef4444', fontSize: 13 }}>{error || 'Fehleranalyse nicht verfügbar'}</p>
      </div>
    )
  }

  const accuracy = summary.accuracy
  const accuracyColor = accuracy >= 80 ? '#22c55e' : accuracy >= 60 ? '#fbbf24' : '#ef4444'
  const feedbackText = accuracy >= 80 ? '✓ Sehr gut!' : accuracy >= 60 ? '⚠️ Gutes Potenzial' : '💪 Weiterüben'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Main Score Card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Genauigkeit
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 48, fontWeight: 700, color: accuracyColor }}>{accuracy}%</p>
          <p style={{ fontSize: 20, color: 'var(--muted)' }}>{feedbackText}</p>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {summary.totalCorrect} von {summary.totalQuestions} Fragen richtig
        </p>
      </div>

      {/* Error Breakdown */}
      {summary.topErrors.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Häufige Fehlertypen</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {summary.topErrors.map((error, i) => {
              const info = DISTRACTOR_NAMES[error.type] || DISTRACTOR_NAMES.OTHER
              return (
                <div key={i} style={{ padding: '12px', background: 'var(--card-border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{info.label}</p>
                    <p style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#f97316', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                      {error.count} Fehler
                    </p>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 12 }}>{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Speed Feedback */}
      {summary.avgTimeSec && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Bearbeitungsgeschwindigkeit</p>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
            Durchschnitt: <strong style={{ color: 'var(--fg)' }}>{summary.avgTimeSec}s pro Frage</strong>
          </p>
          <p style={{ fontSize: 13, color: summary.avgTimeSec > summary.speedTarget ? '#ef4444' : '#22c55e' }}>
            {summary.speedFeedback}
          </p>
        </div>
      )}

      {/* Next Steps Recommendation */}
      {summary.topErrors.length > 0 && (
        <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: 12, padding: '16px' }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: '#4f46e5', marginBottom: 8 }}>
            💡 Beim nächsten Training beachten:
          </p>
          <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20 }}>
            {summary.topErrors.slice(0, 2).map((error, i) => {
              const info = DISTRACTOR_NAMES[error.type] || DISTRACTOR_NAMES.OTHER
              return (
                <li key={i}>
                  <strong style={{ color: 'var(--fg)' }}>Achte auf {info.label.split(' ').pop()}:</strong> {info.description.toLowerCase()}
                </li>
              )
            })}
            <li>
              <strong style={{ color: 'var(--fg)' }}>Langsamer vorgehen:</strong> Lese Fragen und Optionen genau durch — Eile führt zu Fallen
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
