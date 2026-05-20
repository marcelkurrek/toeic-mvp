'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react'

type WritingPart = 'sentences' | 'email' | 'essay'

interface Question {
  id: string
  type: string
  content: Record<string, unknown>
  answer: string
  explanation: string | null
}

interface TaskMeta {
  label: string
  color: string
  desc: string
  timeSec: number
  minWords: number
  targetWords: number
}

const TASK_META: Record<WritingPart, TaskMeta> = {
  sentences: {
    label: 'Task 1–5: Sätze schreiben',
    color: '#AE00FF',
    desc: 'Schreibe einen grammatikalisch korrekten Satz zum Bild. Verwende beide vorgegebenen Wörter.',
    timeSec: 8 * 60,
    minWords: 5,
    targetWords: 15,
  },
  email: {
    label: 'Task 6–7: E-Mail verfassen',
    color: '#fb923c',
    desc: 'Beantworte die E-Mail vollständig. Gehe auf alle Punkte ein und verwende angemessene Geschäftssprache.',
    timeSec: 10 * 60,
    minWords: 60,
    targetWords: 100,
  },
  essay: {
    label: 'Task 8: Opinion Essay',
    color: '#6366f1',
    desc: 'Schreibe einen strukturierten Essay (mind. 300 Wörter). Formuliere eine klare Meinung mit Begründungen.',
    timeSec: 30 * 60,
    minWords: 250,
    targetWords: 300,
  },
}

function useCountdownTimer(totalSecs: number, running: boolean) {
  const [remaining, setRemaining] = useState(totalSecs)
  useEffect(() => { setRemaining(totalSecs) }, [totalSecs])
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(id)
  }, [running])
  const pct = 1 - remaining / totalSecs
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return { remaining, mins, secs, pct, expired: remaining === 0 }
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

function TimerBar({ mins, secs, pct, color }: { mins: number; secs: number; pct: number; color: string }) {
  const urgent = pct > 0.8
  const barColor = urgent ? '#ef4444' : pct > 0.6 ? '#fbbf24' : color
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Clock size={13} style={{ color: barColor }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: barColor, fontVariantNumeric: 'tabular-nums' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        {urgent && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>— Zeit läuft ab!</span>}
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${pct * 100}%`, transition: 'width 1s linear' }} />
      </div>
    </div>
  )
}

function WordCounter({ count, min, target, color }: { count: number; min: number; target: number; color: string }) {
  const ok = count >= min
  const great = count >= target
  const c = great ? 'var(--success)' : ok ? color : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{count} Wörter</span>
      {!ok && <span style={{ fontSize: 11, color: '#ef4444' }}>Minimum: {min}</span>}
      {ok && !great && <span style={{ fontSize: 11, color }}>Ziel: {target}</span>}
      {great && <CheckCircle size={13} style={{ color: 'var(--success)' }} />}
    </div>
  )
}

// ── Sentence Task (Part 1) ──────────────────────────────────────────────────

function SentenceTask({ question, onSubmit, submitted, feedback }: {
  question: Question
  onSubmit: (text: string) => void
  submitted: boolean
  feedback: string | null
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const words = countWords(text)
  const keywords = (c.keywords as string[]) ?? []

  return (
    <div>
      {c.imageUrl && (
        <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 240 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.imageUrl as string} alt="Writing task" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
        </div>
      )}
      {keywords.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pflicht-Wörter:</span>
          {keywords.map(k => (
            <span key={k} style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(174,0,255,0.15)', color: '#AE00FF', border: '1px solid rgba(174,0,255,0.3)' }}>{k}</span>
          ))}
        </div>
      )}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        placeholder="Schreibe hier deinen Satz…"
        rows={3}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      <WordCounter count={words} min={5} target={12} color="#AE00FF" />
      {!submitted && (
        <button onClick={() => onSubmit(text)} disabled={words < 3}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 5 ? '#AE00FF' : 'var(--card-border)', color: words >= 5 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 3 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Einreichen
        </button>
      )}
      {submitted && feedback && (
        <div style={{ marginTop: 16, padding: '16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Feedback:</p>
          <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.7 }}>{feedback}</p>
          {question.answer && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Beispielantwort:</p>
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--fg)' }}>{question.answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Email Task (Part 2) ─────────────────────────────────────────────────────

function EmailTask({ question, onSubmit, submitted, feedback }: {
  question: Question
  onSubmit: (text: string) => void
  submitted: boolean
  feedback: string | null
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const words = countWords(text)

  return (
    <div>
      {/* Email to respond to */}
      <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eingehende E-Mail</p>
        {c.from && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Von: {c.from as string}</p>}
        {c.subject && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Betreff: {c.subject as string}</p>}
        <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{(c.body ?? c.prompt) as string}</p>
      </div>

      {c.instructions && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-border)', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aufgabe: {c.instructions as string}</p>
        </div>
      )}

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        placeholder="Schreibe hier deine Antwort-E-Mail…"
        rows={8}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      <WordCounter count={words} min={60} target={100} color="#fb923c" />

      {!submitted && (
        <button onClick={() => onSubmit(text)} disabled={words < 20}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 60 ? '#fb923c' : 'var(--card-border)', color: words >= 60 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 20 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Einreichen
        </button>
      )}
      {submitted && feedback && (
        <div style={{ marginTop: 16, padding: '16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Feedback:</p>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>{feedback}</p>
        </div>
      )}
    </div>
  )
}

// ── Essay Task (Part 3) ─────────────────────────────────────────────────────

function EssayTask({ question, onSubmit, submitted, feedback }: {
  question: Question
  onSubmit: (text: string) => void
  submitted: boolean
  feedback: string | null
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const words = countWords(text)

  return (
    <div>
      <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aufgabenstellung</p>
        <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>{(c.prompt ?? c.question) as string}</p>
      </div>

      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-border)', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Formuliere eine klare Meinung und stütze sie mit mindestens 2 Begründungen. Empfehlung: Einleitung → Argument 1 → Argument 2 → Schluss.
        </p>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        placeholder="Schreibe hier deinen Essay (mind. 300 Wörter)…"
        rows={14}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.7 }}
      />
      <WordCounter count={words} min={250} target={300} color="#6366f1" />

      {words > 0 && words < 250 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <AlertTriangle size={13} style={{ color: '#fbbf24' }} />
          <p style={{ fontSize: 12, color: '#fbbf24' }}>Noch {250 - words} Wörter bis zum Minimum</p>
        </div>
      )}

      {!submitted && (
        <button onClick={() => onSubmit(text)} disabled={words < 100}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 250 ? '#6366f1' : 'var(--card-border)', color: words >= 250 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 100 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Essay einreichen
        </button>
      )}
      {submitted && feedback && (
        <div style={{ marginTop: 16, padding: '16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Feedback:</p>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>{feedback}</p>
        </div>
      )}
    </div>
  )
}

// ── Main Shell ────────────────────────────────────────────────────────────────

export default function WritingShell({ writingPart }: { writingPart: WritingPart }) {
  const router = useRouter()
  const meta = TASK_META[writingPart]
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [timerRunning, setTimerRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const timer = useCountdownTimer(meta.timeSec, timerRunning)

  const typeMap: Record<WritingPart, string> = {
    sentences: 'WRITE_SENTENCE',
    email: 'RESPOND_EMAIL',
    essay: 'OPINION_ESSAY',
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/questions?section=WRITING&limit=3`)
      const data = await res.json()
      const filtered = (data.questions ?? []).filter((q: Question) => q.type === typeMap[writingPart])
      setQuestions(filtered.length > 0 ? filtered : data.questions ?? [])
      setLoading(false)
      setTimerRunning(true)
    }
    load()
  }, [writingPart])

  useEffect(() => {
    setSubmitted(false)
    setFeedback(null)
  }, [currentIndex])

  useEffect(() => {
    if (timer.expired && !submitted && questions.length > 0) handleSubmit('')
  }, [timer.expired])

  const handleSubmit = useCallback(async (text: string) => {
    setSubmitted(true)
    setTimerRunning(false)
    const q = questions[currentIndex]
    if (!q) return
    try {
      const res = await fetch('/api/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, type: q.type, answer: text, question: q.content }),
      })
      const data = await res.json()
      setFeedback(data.feedback ?? data.error ?? 'Feedback wird geladen…')
      setScores(prev => [...prev, data.score ?? 0])
    } catch {
      setFeedback('Feedback konnte nicht geladen werden.')
    }
  }, [questions, currentIndex])

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
      setTimerRunning(true)
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 4 }}>{meta.label}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{meta.desc}</p>
      </div>
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Aufgaben werden geladen…</div>
    </div>
  )

  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 20) : 0
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
        <h2 className="text-2xl font-bold" style={{ marginBottom: 8 }}>Writing abgeschlossen!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>{questions.length} Aufgabe{questions.length !== 1 ? 'n' : ''} bearbeitet</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => router.push('/test-training')}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
            Zurück
          </button>
          <button onClick={() => { setFinished(false); setCurrentIndex(0); setSubmitted(false); setFeedback(null); setTimerRunning(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: meta.color + '20', border: `1.5px solid ${meta.color}50`, color: meta.color, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <RotateCcw size={14} /> Nochmal
          </button>
        </div>
      </div>
    )
  }

  if (!questions.length) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>Keine Schreibaufgaben verfügbar.</p>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Führe <code>npm run db:seed</code> im Codespace aus.</p>
      </div>
    </div>
  )

  const q = questions[currentIndex]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 4 }}>{meta.label}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{meta.desc}</p>
      </div>

      <TimerBar mins={timer.mins} secs={timer.secs} pct={timer.pct} color={meta.color} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
          Aufgabe {currentIndex + 1} / {questions.length}
        </p>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: meta.color + '15', color: meta.color, fontWeight: 700 }}>
          WRITING
        </span>
      </div>

      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        {writingPart === 'sentences' && (
          <SentenceTask question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} />
        )}
        {writingPart === 'email' && (
          <EmailTask question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} />
        )}
        {writingPart === 'essay' && (
          <EssayTask question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} />
        )}
      </div>

      {submitted && (
        <button onClick={handleNext}
          style={{ width: '100%', padding: '12px', borderRadius: 10, background: meta.color, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {currentIndex + 1 >= questions.length ? 'Auswertung anzeigen' : 'Nächste Aufgabe'}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
