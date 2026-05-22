'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Filter, TrendingDown } from 'lucide-react'

interface ErrorAnswer {
  id: string
  questionId: string
  userAnswer: string
  correctAnswer: string
  distractorType: string
  part: number
  createdAt: string
}

const DISTRACTOR_COLORS: Record<string, string> = {
  SOUND_ALIKE: '#f97316',
  HOMONYM: '#6366f1',
  RELATED_WORD: '#ec4899',
  OMIT_NECESSARY: '#fbbf24',
  ALTER_WORD_ORDER: '#06b6d4',
  OTHER: '#6b7280',
}

const DISTRACTOR_LABELS: Record<string, { emoji: string; label: string; description: string }> = {
  SOUND_ALIKE: {
    emoji: '🔊',
    label: 'Sound-alike Traps',
    description: 'Ähnlich klingende Wörter verwechselt (z.B. "hired" vs. "tired")',
  },
  HOMONYM: {
    emoji: '📚',
    label: 'Homonyme',
    description: 'Gleiche Aussprache, andere Bedeutung (z.B. "hear" vs. "here")',
  },
  RELATED_WORD: {
    emoji: '🎯',
    label: 'Related-word Traps',
    description: 'Semantisch verwandt aber falsch (z.B. "meeting" statt "conference")',
  },
  OMIT_NECESSARY: {
    emoji: '⚠️',
    label: 'Fehlende Wörter',
    description: 'Ein wichtiges Wort vergessen oder übersehen',
  },
  ALTER_WORD_ORDER: {
    emoji: '🔄',
    label: 'Wort-Reihenfolge',
    description: 'Richtige Wörter, falsche Reihenfolge oder Grammatik',
  },
  OTHER: {
    emoji: '❓',
    label: 'Sonstiges',
    description: 'Andere Fehlertypen',
  },
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const res = await fetch('/api/errors/answers?limit=1000')
        if (!res.ok) throw new Error('Failed to fetch errors')
        const data = await res.json()
        setErrors(data.answers || [])
      } catch (err) {
        console.error('Error fetching errors:', err)
        setError('Fehler konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    fetchErrors()
  }, [])

  const filteredErrors = filter === 'all'
    ? errors
    : errors.filter(e => e.distractorType === filter)

  const allDistractorTypes = Array.from(new Set(errors.map(e => e.distractorType)))
  const errorCounts = Object.fromEntries(
    allDistractorTypes.map(type => [
      type,
      errors.filter(e => e.distractorType === type).length,
    ])
  )

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Fehler werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={14} /> Zurück
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <AlertTriangle size={24} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Meine Fehler</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '4px 0 0 0' }}>
          Analysiere deine Fehler nach TOEIC-Fehlertypen
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {errors.length === 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 14,
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          <TrendingDown size={40} style={{ color: 'var(--muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>✨ Keine Fehler!</p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Du hast bisher keine Fehler gemacht. Weiter so!
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block' }}>
            Zum Dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#fbbf24' }}>{errors.length}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Gesamtfehler</p>
            </div>
            {allDistractorTypes.slice(0, 4).map(type => (
              <div key={type} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: DISTRACTOR_COLORS[type] }}>
                  {errorCounts[type]}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {DISTRACTOR_LABELS[type]?.emoji} {type}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Filter nach Fehlertyp
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: filter === 'all' ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                  background: filter === 'all' ? 'rgba(79,70,229,0.1)' : 'var(--card)',
                  color: filter === 'all' ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                Alle ({errors.length})
              </button>
              {allDistractorTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: filter === type ? `1px solid ${DISTRACTOR_COLORS[type]}` : '1px solid var(--card-border)',
                    background: filter === type ? `${DISTRACTOR_COLORS[type]}15` : 'var(--card)',
                    color: filter === type ? DISTRACTOR_COLORS[type] : 'var(--muted)',
                    cursor: 'pointer',
                  }}
                >
                  {DISTRACTOR_LABELS[type]?.emoji} {type} ({errorCounts[type]})
                </button>
              ))}
            </div>
          </div>

          {/* Error List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredErrors.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '40px 20px' }}>
                Keine Fehler dieses Typs
              </p>
            ) : (
              filteredErrors.map((err) => (
                <div
                  key={err.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderLeft: `3px solid ${DISTRACTOR_COLORS[err.distractorType]}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: `${DISTRACTOR_COLORS[err.distractorType]}20`,
                            color: DISTRACTOR_COLORS[err.distractorType],
                          }}
                        >
                          Part {err.part}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: `${DISTRACTOR_COLORS[err.distractorType]}20`,
                            color: DISTRACTOR_COLORS[err.distractorType],
                          }}
                        >
                          {DISTRACTOR_LABELS[err.distractorType]?.emoji} {err.distractorType}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 6 }}>
                        <strong>Deine Antwort:</strong> {err.userAnswer}
                      </p>
                      <p style={{ fontSize: 13, color: '#22c55e', marginBottom: 8 }}>
                        <strong>Richtige Antwort:</strong> {err.correctAnswer}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {new Date(err.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  {DISTRACTOR_LABELS[err.distractorType] && (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--fg)' }}>Fehlertyp:</strong> {DISTRACTOR_LABELS[err.distractorType].description}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
