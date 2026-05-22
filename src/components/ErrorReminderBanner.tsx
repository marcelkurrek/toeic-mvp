'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, X } from 'lucide-react'

interface ErrorPattern {
  distractorType: string
  frequency: number
  urgencyScore: number
}

interface Props {
  userId?: string
  onDismiss?: () => void
}

const DISTRACTOR_LABELS: Record<string, { emoji: string; label: string; tip: string }> = {
  SOUND_ALIKE: {
    emoji: '🔊',
    label: 'Sound-alike Traps',
    tip: 'Du verwechselst ähnlich klingende Wörter. Lies Optionen LAUT vor, um Unterschiede zu hören.',
  },
  HOMONYM: {
    emoji: '📚',
    label: 'Homonyme',
    tip: 'Gleiche Aussprache, andere Bedeutung. Achte auf den KONTEXT um die richtige Bedeutung zu erkennen.',
  },
  RELATED_WORD: {
    emoji: '🎯',
    label: 'Related-word Traps',
    tip: 'Semantisch verwandte Wörter sind nicht automatisch richtig. Lese genau, was gefragt ist.',
  },
  OMIT_NECESSARY: {
    emoji: '⚠️',
    label: 'Fehlende Wörter',
    tip: 'Achte auf kleine aber wichtige Wörter: Präpositionen, Artikel, Modalverben.',
  },
  ALTER_WORD_ORDER: {
    emoji: '🔄',
    label: 'Wort-Reihenfolge',
    tip: 'Richtige Wörter, falsche Reihenfolge oder Grammatik. Prüfe Verb-Stellung und Satzstruktur.',
  },
}

export function ErrorReminderBanner({ userId, onDismiss }: Props) {
  const [patterns, setPatterns] = useState<ErrorPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchErrorPatterns = async () => {
      try {
        const res = await fetch('/api/errors/patterns')
        if (!res.ok) throw new Error('Failed to fetch patterns')
        const data = await res.json()
        setPatterns(data.errorPatterns || [])
      } catch (err) {
        console.error('Error fetching patterns:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!dismissed) {
      fetchErrorPatterns()
    }
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  // Only show if there are high-urgency patterns
  const topPatterns = patterns
    .filter(p => p.urgencyScore > 0)
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 2)

  if (loading || dismissed || topPatterns.length === 0) return null

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(251,146,60,0.1) 0%, rgba(251,146,60,0.05) 100%)',
        border: '1px solid rgba(251,146,60,0.3)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        position: 'relative',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--muted)',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <AlertTriangle size={18} style={{ color: '#f97316', flexShrink: 0 }} />
        <p style={{ fontWeight: 700, fontSize: 14, color: '#f97316' }}>
          ⚡ Achte heute besonders auf diese Fehlertypen:
        </p>
      </div>

      {/* Error patterns list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topPatterns.map((pattern) => {
          const info = DISTRACTOR_LABELS[pattern.distractorType]
          if (!info) return null
          return (
            <div key={pattern.distractorType} style={{ paddingLeft: 28 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {info.emoji} <strong>{info.label}</strong> ({pattern.frequency} Fehler)
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                💡 {info.tip}
              </p>
            </div>
          )
        })}
      </div>

      {/* Call to action */}
      <div style={{ paddingLeft: 28, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(251,146,60,0.2)' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Diese Tipps basieren auf deinen letzten Übungen. Je mehr du trainierst, desto präziser wird die Analyse.
        </p>
      </div>
    </div>
  )
}
