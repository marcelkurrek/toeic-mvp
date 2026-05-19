'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RotateCcw, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import type { Question } from '@/types'

type WritingMode = 'sentences' | 'email' | 'essay'

interface WritingShellProps {
  mode: WritingMode
}

interface FeedbackResult {
  score: number
  feedback: string
  tips: string[]
}

// ── Countdown timer display ───────────────────────────────────────────────────
function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const warn = seconds < 120
  return (
    <span className="flex items-center gap-1 text-sm font-mono font-semibold"
      style={{ color: warn ? 'var(--error)' : 'var(--muted)' }}>
      <Clock size={13} />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ── Write Sentence Task ───────────────────────────────────────────────────────
function SentenceTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as { imageUrl: string; keywords: string[]; instructions: string; timeLimitSec: number }
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSec)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function handleSubmit() {
    if (!text.trim()) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)
    setLoading(true)
    fetch('/api/writing-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, questionType: 'WRITE_SENTENCE', keywords: content.keywords }),
    })
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Einen Satz schreiben</p>
        {!submitted && <TimerDisplay seconds={timeLeft} />}
      </div>

      {/* Image */}
      <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 260 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.imageUrl} alt="Write a sentence about this" style={{ width: '100%', objectFit: 'cover', maxHeight: 260 }} />
      </div>

      {/* Keywords */}
      <div className="flex gap-2 flex-wrap mb-3">
        {content.keywords.map(kw => (
          <span key={kw} className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#fff' }}>{kw}</span>
        ))}
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{content.instructions}</p>

      <textarea
        disabled={submitted}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schreibe hier deinen Satz…"
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10, resize: 'vertical',
          background: 'var(--input-bg)', border: '1px solid var(--card-border)',
          color: 'var(--foreground)', fontSize: 14, lineHeight: 1.6, marginBottom: 16,
        }}
      />

      {!submitted && (
        <button onClick={handleSubmit} disabled={!text.trim()} className="btn-primary">
          Abgeben
        </button>
      )}

      {submitted && (
        loading ? <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
        : feedback ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: feedback.score >= 70 ? 'var(--green-subtle)' : feedback.score >= 40 ? 'var(--orange-subtle)' : 'rgba(248,113,113,0.1)',
                  color: feedback.score >= 70 ? 'var(--success)' : feedback.score >= 40 ? 'var(--warning)' : 'var(--error)',
                }}>
                {feedback.score}
              </div>
              <p className="text-sm font-semibold">Punkte</p>
            </div>
            <div className="rounded-lg p-4 mb-3 text-sm"
              style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
              {feedback.feedback}
            </div>
            {feedback.tips.length > 0 && (
              <ul className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', marginTop: 2 }}>•</span>
                    <span style={{ color: 'var(--muted)' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            {question.explanation && (
              <div className="rounded-lg p-3 mb-3 text-sm" style={{ background: 'var(--surface)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--accent)' }}>Beispiel:</p>
                <p>{question.explanation}</p>
              </div>
            )}
            <button onClick={onNext} className="btn-primary flex items-center gap-2">
              {isLast ? 'Fertig' : 'Weiter'} <ChevronRight size={16} />
            </button>
          </div>
        ) : null
      )}
    </div>
  )
}

// ── Respond Email Task ────────────────────────────────────────────────────────
function EmailTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as {
    email: { from: string; to: string; subject: string; body: string }
    instructions: string
    timeLimitSec: number
  }
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSec)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const wc = text.trim().split(/\s+/).filter(Boolean).length

  function handleSubmit() {
    if (!text.trim()) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)
    setLoading(true)
    fetch('/api/writing-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, questionType: 'RESPOND_EMAIL' }),
    })
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>E-Mail beantworten</p>
        {!submitted && <TimerDisplay seconds={timeLeft} />}
      </div>

      {/* Incoming email */}
      <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px 8px', marginBottom: 10, fontSize: 12, color: 'var(--muted)' }}>
          <span>Von:</span><span style={{ color: 'var(--foreground)' }}>{content.email.from}</span>
          <span>An:</span><span style={{ color: 'var(--foreground)' }}>{content.email.to}</span>
          <span>Betreff:</span><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{content.email.subject}</span>
        </div>
        <p className="leading-relaxed whitespace-pre-wrap" style={{ borderTop: '1px solid var(--card-border)', paddingTop: 10 }}>{content.email.body}</p>
      </div>

      <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{content.instructions}</p>

      <textarea
        disabled={submitted}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schreibe hier deine Antwort-E-Mail…"
        rows={8}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10, resize: 'vertical',
          background: 'var(--input-bg)', border: '1px solid var(--card-border)',
          color: 'var(--foreground)', fontSize: 14, lineHeight: 1.6, marginBottom: 8,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{wc} Wörter</span>
        {!submitted && (
          <button onClick={handleSubmit} disabled={!text.trim()} className="btn-primary">Abgeben</button>
        )}
      </div>

      {submitted && (
        loading ? <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
        : feedback ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: feedback.score >= 70 ? 'var(--green-subtle)' : feedback.score >= 40 ? 'var(--orange-subtle)' : 'rgba(248,113,113,0.1)',
                  color: feedback.score >= 70 ? 'var(--success)' : feedback.score >= 40 ? 'var(--warning)' : 'var(--error)',
                }}>
                {feedback.score}
              </div>
              <p className="text-sm font-semibold">Punkte</p>
            </div>
            <div className="rounded-lg p-4 mb-3 text-sm"
              style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
              {feedback.feedback}
            </div>
            {feedback.tips.length > 0 && (
              <ul className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', marginTop: 2 }}>•</span>
                    <span style={{ color: 'var(--muted)' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={onNext} className="btn-primary flex items-center gap-2">
              {isLast ? 'Fertig' : 'Weiter'} <ChevronRight size={16} />
            </button>
          </div>
        ) : null
      )}
    </div>
  )
}

// ── Opinion Essay Task ────────────────────────────────────────────────────────
function EssayTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as {
    prompt: string
    timeLimitSec: number
    minWords: number
    structure: string[]
  }
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSec)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const wc = text.trim().split(/\s+/).filter(Boolean).length
  const wcOk = wc >= content.minWords

  function handleSubmit() {
    if (!text.trim()) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)
    setLoading(true)
    fetch('/api/writing-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, questionType: 'OPINION_ESSAY' }),
    })
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Meinungsaufsatz</p>
        {!submitted && <TimerDisplay seconds={timeLeft} />}
      </div>

      {/* Prompt */}
      <div className="rounded-lg p-4 mb-4 text-sm leading-relaxed"
        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        {content.prompt}
      </div>

      {/* Structure guide */}
      {content.structure && (
        <div className="flex gap-2 flex-wrap mb-4">
          {content.structure.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
      )}

      <textarea
        disabled={submitted}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schreibe hier deinen Aufsatz…"
        rows={14}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10, resize: 'vertical',
          background: 'var(--input-bg)', border: '1px solid var(--card-border)',
          color: 'var(--foreground)', fontSize: 14, lineHeight: 1.6, marginBottom: 8,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="text-xs flex items-center gap-1"
          style={{ color: wcOk ? 'var(--success)' : 'var(--muted)' }}>
          {wcOk ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {wc} / {content.minWords} Wörter
        </span>
        {!submitted && (
          <button onClick={handleSubmit} disabled={!text.trim()} className="btn-primary">Abgeben</button>
        )}
      </div>

      {submitted && (
        loading ? <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
        : feedback ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: feedback.score >= 70 ? 'var(--green-subtle)' : feedback.score >= 40 ? 'var(--orange-subtle)' : 'rgba(248,113,113,0.1)',
                  color: feedback.score >= 70 ? 'var(--success)' : feedback.score >= 40 ? 'var(--warning)' : 'var(--error)',
                }}>
                {feedback.score}
              </div>
              <p className="text-sm font-semibold">Punkte</p>
            </div>
            <div className="rounded-lg p-4 mb-3 text-sm"
              style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
              {feedback.feedback}
            </div>
            {feedback.tips.length > 0 && (
              <ul className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', marginTop: 2 }}>•</span>
                    <span style={{ color: 'var(--muted)' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={onNext} className="btn-primary flex items-center gap-2">
              {isLast ? 'Fertig' : 'Weiter'} <ChevronRight size={16} />
            </button>
          </div>
        ) : null
      )}
    </div>
  )
}

// ── Main WritingShell ─────────────────────────────────────────────────────────
export default function WritingShell({ mode }: WritingShellProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)

  const modeConfig = {
    sentences: { label: 'Writing – Sätze schreiben', part: 1, back: '/writing' },
    email:     { label: 'Writing – E-Mail verfassen', part: 2, back: '/writing' },
    essay:     { label: 'Writing – Essay', part: 3, back: '/writing' },
  }

  const config = modeConfig[mode]

  const load = useCallback(async () => {
    setLoading(true)
    setIndex(0)
    setFinished(false)
    const res = await fetch(`/api/questions?section=WRITING&part=${config.part}`)
    const data = await res.json()
    setQuestions(data.questions ?? [])
    setLoading(false)
  }, [config.part])

  useEffect(() => { load() }, [load])

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-4">{config.label}</h1>
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Aufgaben werden geladen…
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-4">{config.label}</h1>
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Keine Aufgaben verfügbar.
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-6">{config.label} — Fertig!</h1>
        <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <p className="text-lg font-semibold mb-1">Alle Aufgaben abgeschlossen!</p>
          <p style={{ color: 'var(--muted)' }}>Regelmäßiges Schreiben verbessert deinen TOEIC Writing Score.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={load} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> Nochmals üben
          </button>
          <button onClick={() => router.push(config.back)}
            className="text-sm font-medium rounded-lg border"
            style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>
            Zurück zu Writing
          </button>
        </div>
      </div>
    )
  }

  const question = questions[index] as Question

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="text-2xl font-bold">{config.label}</h1>
        <div className="text-sm font-medium rounded-full"
          style={{ padding: '4px 14px', background: 'var(--card-border)', whiteSpace: 'nowrap' }}>
          {index + 1} / {questions.length}
        </div>
      </div>

      <div className="rounded-full overflow-hidden" style={{ height: 6, marginBottom: 24, background: 'var(--card-border)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {mode === 'sentences' && (
        <SentenceTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
      {mode === 'email' && (
        <EmailTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
      {mode === 'essay' && (
        <EssayTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
    </div>
  )
}
