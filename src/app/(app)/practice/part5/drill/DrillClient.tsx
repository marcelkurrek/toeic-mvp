'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Target } from 'lucide-react'

const PATTERN_LABELS: Record<string, string> = {
  'verb-form': 'Verb-Form',
  'preposition': 'Präpositionen',
  'connector': 'Konnektoren',
  'pronoun': 'Pronomen',
  'article': 'Artikel',
  'tense': 'Zeitform',
  'word-form': 'Wortform',
  'comparison': 'Vergleiche',
  'relative-clause': 'Relativsätze',
  'conditional': 'Konditional',
  'passive': 'Passiv',
  'reported-speech': 'Indirekte Rede',
  'vocabulary': 'Wortschatz',
  'collocation': 'Kollokationen',
  'idiom': 'Idiome',
}

interface Question {
  id: string
  content: { question?: string; text?: string }
  options: Record<string, string> | string[]
  answer: string
  explanation: string | null
  tags: string[]
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function DrillClient() {
  const params = useSearchParams()
  const router = useRouter()
  const pattern = params.get('pattern') ?? ''
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!pattern) return
    setLoading(true)
    fetch(`/api/questions?part=5&tag=${encodeURIComponent(pattern)}&limit=10`)
      .then(r => r.json())
      .then(data => { setQuestions(data.questions ?? []); setLoading(false) })
  }, [pattern])

  const patternLabel = PATTERN_LABELS[pattern] ?? pattern

  function handleSelect(letter: string) {
    if (!submitted) setSelected(letter)
  }

  function handleSubmit() {
    if (!selected || submitted) return
    const q = questions[currentIdx]
    const correct = selected === q.answer
    const time = Math.round((Date.now() - startRef.current) / 1000)
    setAnswers(prev => [...prev, { correct, time }])
    setSubmitted(true)
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setSubmitted(false)
      startRef.current = Date.now()
    }
  }

  if (!pattern) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 0', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Kein Grammatikmuster ausgewählt. Gehe zur <a href="/progress" style={{ color: 'var(--accent)' }}>Fortschritts-Seite</a> und wähle ein Muster zum Üben.</p>
    </div>
  )

  if (loading) return <div style={{ maxWidth: 640, margin: '0 auto', padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Fragen werden geladen…</div>

  if (questions.length === 0) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Keine Fragen für Muster: {patternLabel}</p>
      <button onClick={() => router.push('/progress')} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Zurück zum Fortschritt</button>
    </div>
  )

  if (finished) {
    const correct = answers.filter(a => a.correct).length
    const total = answers.length
    const pct = total > 0 ? Math.round(correct / total * 100) : 0
    const avgTime = total > 0 ? Math.round(answers.reduce((s, a) => s + a.time, 0) / total) : 0
    const pctColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : '#ef4444'
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>Drill: {patternLabel}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Ergebnis</p>
        <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <Target size={20} style={{ color: '#D5FD44' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#D5FD44', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{patternLabel}</span>
          </div>
          <p style={{ fontSize: 64, fontWeight: 800, color: pctColor, lineHeight: 1, marginBottom: 8 }}>{pct}%</p>
          <p className="text-lg font-semibold" style={{ marginBottom: 4 }}>{correct}/{total} richtig</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Ø {avgTime}s pro Frage · Ziel: 45s</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {pct >= 80 ? '✅ Dieses Muster sitzt! Weiter mit dem nächsten schwachen Muster.' : pct >= 60 ? '💪 Gut — nochmals üben bis 80%+.' : '📚 Weiter üben — dieses Muster braucht mehr Attention.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setFinished(false); setCurrentIdx(0); setAnswers([]); setSelected(null); setSubmitted(false); startRef.current = Date.now() }}
            className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <RotateCcw size={14} /> Nochmal
          </button>
          <button onClick={() => router.push('/progress')}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            Zum Fortschritt
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentIdx]
  const opts = Array.isArray(q.options) ? q.options : Object.values(q.options as Record<string, string>)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Target size={16} style={{ color: '#D5FD44' }} />
          <h1 className="text-xl font-bold">Drill: {patternLabel}</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Part 5 — Gezieltes Grammatik-Training</p>
      </div>

      <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: '#D5FD44', width: `${(currentIdx / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Frage {currentIdx + 1} / {questions.length}</p>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: 'rgba(213,253,68,0.15)', color: '#D5FD44', fontWeight: 700 }}>{patternLabel}</span>
      </div>

      <div className="card" style={{ padding: '24px 28px' }}>
        <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>
          {q.content.question ?? q.content.text ?? `Frage ${currentIdx + 1}`}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {opts.map((opt, i) => {
            const letter = LETTERS[i]
            const isSelected = selected === letter
            const isCorrect = submitted && letter === q.answer
            const isWrong = submitted && isSelected && !isCorrect
            return (
              <button key={i} disabled={submitted} onClick={() => handleSelect(letter)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10,
                border: `1.5px solid ${isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--card-border)'}`,
                background: isCorrect ? 'rgba(74,222,128,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : isSelected ? 'var(--accent-subtle)' : 'transparent',
                cursor: submitted ? 'default' : 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s',
              }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  background: isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--card-border)',
                  color: (isCorrect || isWrong || isSelected) ? '#fff' : 'var(--muted)',
                }}>{letter}</span>
                <span style={{ fontSize: 14, color: isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : 'var(--fg)' }}>{opt}</span>
                {isCorrect && <CheckCircle size={14} style={{ color: 'var(--success)', marginLeft: 'auto' }} />}
                {isWrong && <XCircle size={14} style={{ color: '#ef4444', marginLeft: 'auto' }} />}
              </button>
            )
          })}
        </div>

        {submitted && q.explanation && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(213,253,68,0.06)', borderLeft: '3px solid #D5FD44', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#D5FD44', marginBottom: 4 }}>Erklärung</p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {submitted ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: answers[answers.length-1]?.correct ? 'var(--success)' : '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
              {answers[answers.length-1]?.correct ? <><CheckCircle size={15} /> Richtig!</> : <><XCircle size={15} /> Falsch — Antwort: {q.answer}</>}
            </span>
          ) : <div />}
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!selected} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px', marginLeft: 'auto' }}>
              Antworten
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {currentIdx < questions.length - 1 ? <><ChevronRight size={15} /> Weiter</> : <>Ergebnis</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
