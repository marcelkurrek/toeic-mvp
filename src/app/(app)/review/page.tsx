'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronRight, Brain, RotateCcw, Flame } from 'lucide-react'

interface SrsQuestion {
  id: string
  part: number
  section: string
  type: string
  content: Record<string, unknown>
  options: Record<string, string> | null
  answer: string
  explanation: string | null
}

interface SrsCard {
  id: string
  questionId: string
  repetitions: number
  interval: number
  easeFactor: number
  question: SrsQuestion
}

interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpentSec: number
}

type Phase = 'loading' | 'empty' | 'quiz' | 'done'

export default function ReviewPage() {
  const router = useRouter()
  const [phase, setPhase]         = useState<Phase>('loading')
  const [cards, setCards]         = useState<SrsCard[]>([])
  const [dueCount, setDueCount]   = useState(0)
  const [index, setIndex]         = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers]     = useState<Answer[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const loadCards = useCallback(async () => {
    setPhase('loading')
    const res = await fetch('/api/srs/due?limit=20')
    const data = await res.json()
    setDueCount(data.dueCount)
    if (!data.cards?.length) { setPhase('empty'); return }
    setCards(data.cards)
    setIndex(0)
    setAnswers([])

    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'PART_PRACTICE', parts: [], totalQuestions: data.cards.length }),
    })
    const sessionData = await sessionRes.json()
    setSessionId(sessionData.id)
    setPhase('quiz')
    setStartTime(Date.now())
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  useEffect(() => {
    if (phase === 'quiz') {
      setSelected(null)
      setSubmitted(false)
      setStartTime(Date.now())
    }
  }, [index, phase])

  const card = cards[index]
  const q    = card?.question

  function handleSubmit() {
    if (!selected || !q) return
    const isCorrect = selected === q.answer
    const timeSpentSec = Math.round((Date.now() - startTime) / 1000)
    setAnswers(prev => [...prev, { questionId: q.id, userAnswer: selected, isCorrect, timeSpentSec }])
    setSubmitted(true)
  }

  async function handleNext() {
    if (index + 1 >= cards.length) {
      // All done — save session (which triggers SRS update)
      if (sessionId && !saving) {
        setSaving(true)
        const finalAnswers = [...answers]
        const score = finalAnswers.filter(a => a.isCorrect).length
        const durationSec = finalAnswers.reduce((s, a) => s + a.timeSpentSec, 0)
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, maxScore: cards.length, durationSec, answers: finalAnswers }),
        })
      }
      setPhase('done')
    } else {
      setIndex(i => i + 1)
    }
  }

  function getOptions(): Record<string, string> {
    if (q?.options && typeof q.options === 'object') return q.options as Record<string, string>
    const content = q?.content as Record<string, unknown>
    if (content?.options && typeof content.options === 'object') return content.options as Record<string, string>
    return {}
  }

  function getContentText(): string {
    const content = q?.content as Record<string, unknown>
    return (content?.text ?? content?.question ?? content?.sentence ?? '') as string
  }

  function getIntervalLabel(interval: number): string {
    if (interval === 1) return 'Morgen'
    if (interval < 7) return `In ${interval} Tagen`
    if (interval < 30) return `In ${Math.round(interval / 7)} Woche(n)`
    return `In ${Math.round(interval / 30)} Monat(en)`
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 80, textAlign: 'center' }}>
        <Brain size={40} style={{ color: 'var(--accent)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted)' }}>Wiederholungskarten laden…</p>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (phase === 'empty') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 80 }}>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 className="text-xl font-bold" style={{ marginBottom: 8 }}>Alles erledigt!</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
            Für heute gibt es keine fälligen Wiederholungskarten. Übe weiter, um neue Karten zu erstellen.
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Done ────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const correct = answers.filter(a => a.isCorrect).length
    const pct     = Math.round(correct / cards.length * 100)
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 80 }}>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>
            {pct >= 80 ? '🏆' : pct >= 60 ? '💪' : '📚'}
          </div>
          <h2 className="text-xl font-bold" style={{ marginBottom: 4 }}>Sitzung abgeschlossen</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28 }}>{cards.length} Karten wiederholt</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Richtig', value: correct, color: 'var(--success)' },
              { label: 'Falsch',  value: cards.length - correct, color: 'var(--error)' },
              { label: 'Quote',   value: `${pct}%`, color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ padding: '14px 10px' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {dueCount > cards.length && (
              <button onClick={loadCards} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} /> Weitere {dueCount - cards.length} Karten
              </button>
            )}
            <button onClick={() => router.push('/dashboard')}
              className={dueCount > cards.length ? '' : 'btn-primary'}
              style={dueCount > cards.length ? { padding: '10px 20px', color: 'var(--muted)' } : {}}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz ────────────────────────────────────────────────────────────────
  const options = getOptions()
  const hasOptions = Object.keys(options).length > 0
  const isCorrect = submitted && selected === q?.answer
  const nextAnswer = answers[answers.length - 1]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold">SRS Wiederholung</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {index + 1} / {cards.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={14} style={{ color: '#fb923c' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dueCount} fällig</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'var(--card-border)', marginBottom: 28 }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(index / cards.length) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {/* Card meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
          background: 'var(--accent-subtle)', color: 'var(--accent)',
        }}>Part {q?.part}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {card.repetitions === 0 ? 'Neu' : `${card.repetitions}× gelernt · ${getIntervalLabel(card.interval)}`}
        </span>
      </div>

      {/* Question */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
        <p className="text-sm" style={{ lineHeight: 1.7, color: 'var(--foreground)' }}>
          {getContentText()}
        </p>
      </div>

      {/* Options */}
      {hasOptions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {Object.entries(options).map(([key, text]) => {
            const isAnswer  = key === q?.answer
            const isChosen  = key === selected
            let borderColor = 'var(--card-border)'
            let bg          = 'transparent'
            let textColor   = 'var(--foreground)'

            if (submitted) {
              if (isAnswer)              { borderColor = 'var(--success)'; bg = 'rgba(74,222,128,0.08)'; textColor = 'var(--success)' }
              else if (isChosen)         { borderColor = 'var(--error)';   bg = 'rgba(248,113,113,0.08)'; textColor = 'var(--error)' }
            } else if (isChosen) {
              borderColor = 'var(--accent)'; bg = 'var(--accent-subtle)'
            }

            return (
              <button key={key} onClick={() => !submitted && setSelected(key)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                border: `2px solid ${borderColor}`,
                background: bg, textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                transition: 'all 0.15s', width: '100%',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: textColor,
                }}>{key}</span>
                <span className="text-sm" style={{ color: textColor, lineHeight: 1.5 }}>{text}</span>
                {submitted && isAnswer && <CheckCircle size={16} style={{ color: 'var(--success)', marginLeft: 'auto', flexShrink: 0 }} />}
                {submitted && isChosen && !isAnswer && <XCircle size={16} style={{ color: 'var(--error)', marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Richtige Antwort: <strong style={{ color: 'var(--foreground)' }}>{q?.answer}</strong>
          </p>
          {!submitted && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={() => { setSelected('wrong'); setSubmitted(true); setAnswers(p => [...p, { questionId: q!.id, userAnswer: 'wrong', isCorrect: false, timeSpentSec: Math.round((Date.now() - startTime) / 1000) }]) }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '2px solid var(--error)', background: 'transparent', color: 'var(--error)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                ✗ Falsch
              </button>
              <button onClick={() => { setSelected('correct'); setSubmitted(true); setAnswers(p => [...p, { questionId: q!.id, userAnswer: q!.answer, isCorrect: true, timeSpentSec: Math.round((Date.now() - startTime) / 1000) }]) }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '2px solid var(--success)', background: 'transparent', color: 'var(--success)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                ✓ Richtig
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {submitted && q?.explanation && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'var(--accent-subtle)', border: '1px solid var(--accent)', marginBottom: 16 }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent)', marginBottom: 6 }}>Erklärung</p>
          <p className="text-sm" style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{q.explanation}</p>
        </div>
      )}

      {/* Result banner */}
      {submitted && hasOptions && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderRadius: 10, marginBottom: 16,
          background: isCorrect ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
        }}>
          {isCorrect
            ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
            : <XCircle    size={18} style={{ color: 'var(--error)',   flexShrink: 0 }} />}
          <p className="text-sm font-semibold" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
            {isCorrect ? 'Richtig!' : `Falsch — richtig wäre: ${q?.answer}`}
          </p>
        </div>
      )}

      {/* Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!submitted && hasOptions ? (
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Prüfen <ChevronRight size={16} />
          </button>
        ) : submitted ? (
          <button onClick={handleNext} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {index + 1 >= cards.length ? 'Abschließen' : 'Weiter'} <ChevronRight size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
