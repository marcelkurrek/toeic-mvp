'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Filter, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface ErrorAnswer {
  id: string
  questionId: string
  userAnswer: string
  correctAnswer: string
  distractorType: string
  part: number
  createdAt: string
}

interface Props {
  limit?: number
  showTitle?: boolean
}

const DISTRACTOR_COLORS: Record<string, string> = {
  SOUND_ALIKE: '#f97316',
  HOMONYM: '#6366f1',
  RELATED_WORD: '#ec4899',
  OMIT_NECESSARY: '#fbbf24',
  ALTER_WORD_ORDER: '#06b6d4',
}

const DISTRACTOR_LABELS: Record<string, string> = {
  SOUND_ALIKE: '🔊 Sound-alike',
  HOMONYM: '📚 Homonym',
  RELATED_WORD: '🎯 Related-word',
  OMIT_NECESSARY: '⚠️ Fehlende Wörter',
  ALTER_WORD_ORDER: '🔄 Wort-Reihenfolge',
}

export function MyErrorsPanel({ limit = 5, showTitle = true }: Props) {
  const [errors, setErrors] = useState<ErrorAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const res = await fetch('/api/errors/answers')
        if (!res.ok) throw new Error('Failed to fetch errors')
        const data = await res.json()
        setErrors(data.answers || [])
      } catch (err) {
        console.error('Error fetching errors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchErrors()
  }, [])

  const filteredErrors = filter === 'all'
    ? errors
    : errors.filter(e => e.distractorType === filter)

  const displayErrors = filteredErrors.slice(0, limit)
  const allDistractorTypes = Array.from(new Set(errors.map(e => e.distractorType)))

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Fehler werden geladen...</p>
      </div>
    )
  }

  if (errors.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 8 }}>✨ Keine Fehler!</p>
        <p style={{ color: 'var(--muted)', fontSize: 12 }}>Du machst gute Fortschritte. Weiter so!</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Meine letzten Fehler</h2>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', background: 'var(--card-border)', padding: '2px 8px', borderRadius: 99 }}>
            {filteredErrors.length} {filteredErrors.length === 1 ? 'Fehler' : 'Fehler'}
          </span>
        </div>
      )}

      {/* Filter by distractor type */}
      {allDistractorTypes.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: filter === 'all' ? '1px solid var(--accent)' : '1px solid var(--card-border)',
              background: filter === 'all' ? 'rgba(79,70,229,0.1)' : 'var(--card)',
              color: filter === 'all' ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            Alle
          </button>
          {allDistractorTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: filter === type ? `1px solid ${DISTRACTOR_COLORS[type]}` : '1px solid var(--card-border)',
                background: filter === type ? `${DISTRACTOR_COLORS[type]}20` : 'var(--card)',
                color: filter === type ? DISTRACTOR_COLORS[type] : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {DISTRACTOR_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Error list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayErrors.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            Keine Fehler dieses Typs
          </p>
        ) : (
          displayErrors.map((error) => (
            <div
              key={error.id}
              style={{
                padding: '14px 16px',
                background: 'var(--card)',
                border: `1px solid ${DISTRACTOR_COLORS[error.distractorType] || 'var(--card-border)'}20`,
                borderLeft: `3px solid ${DISTRACTOR_COLORS[error.distractorType] || 'var(--muted)'}`,
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: `${DISTRACTOR_COLORS[error.distractorType]}20`,
                    color: DISTRACTOR_COLORS[error.distractorType],
                  }}
                >
                  Part {error.part}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: `${DISTRACTOR_COLORS[error.distractorType]}30`,
                    color: DISTRACTOR_COLORS[error.distractorType],
                  }}
                >
                  {DISTRACTOR_LABELS[error.distractorType]}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 8 }}>
                <strong>Du hast gewählt:</strong> {error.userAnswer}
              </p>
              <p style={{ fontSize: 13, color: 'var(--success)', marginBottom: 8 }}>
                <strong>Richtig ist:</strong> {error.correctAnswer}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                {new Date(error.createdAt).toLocaleDateString('de-DE')}
              </p>
            </div>
          ))
        )}
      </div>

      {filteredErrors.length > limit && (
        <Link
          href="/practice/errors"
          style={{
            display: 'inline-block',
            marginTop: 16,
            padding: '10px 16px',
            borderRadius: 8,
            background: 'var(--accent-subtle)',
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Alle {filteredErrors.length} Fehler anschauen →
        </Link>
      )}
    </div>
  )
}
