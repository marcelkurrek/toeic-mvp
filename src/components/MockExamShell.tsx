'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, ChevronRight, CheckCircle, XCircle, AlertTriangle, BarChart2 } from 'lucide-react'

interface Question {
  id: string
  part: number
  section: string
  content: Record<string, unknown>
  options: unknown
  answer: string
  explanation: string | null
  difficulty: number
}

interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpentSec: number
}

type Phase = 'loading' | 'ready' | 'exam' | 'submitting' | 'results'

function formatTime(sec: number): string {
  if (sec <= 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getOptions(q: Question): Record<string, string> {
  if (q.options && typeof q.options === 'object' && !Array.isArray(q.options))
    return q.options as Record<string, string>
  if (Array.isArray(q.options)) {
    const letters = ['A', 'B', 'C', 'D']
    return Object.fromEntries((q.options as string[]).map((o, i) => [letters[i], o]))
  }
  const c = q.content as Record<string, unknown>
  if (c?.options && typeof c.options === 'object' && !Array.isArray(c.options))
    return c.options as Record<string, string>
  if (Array.isArray(c?.options)) {
    const letters = ['A', 'B', 'C', 'D']
    return Object.fromEntries((c.options as string[]).map((o, i) => [letters[i], o]))
  }
  return {}
}

function getQuestionText(q: Question): string {
  const c = q.content as Record<string, unknown>
  return (c?.question ?? c?.text ?? c?.sentence ?? c?.statement ?? '') as string
}

function getPassage(q: Question): string | null {
  const c = q.content as Record<string, unknown>
  return (c?.passage ?? null) as string | null
}

function partLabel(part: number): string {
  const labels: Record<number, string> = {
    1: 'Part 1 – Fotografien',
    2: 'Part 2 – Frage & Antwort',
    3: 'Part 3 – Gespräche',
    4: 'Part 4 – Monologe',
    5: 'Part 5 – Satzergänzung',
    6: 'Part 6 – Textergänzung',
    7: 'Part 7 – Leseverstehen',
  }
  return labels[part] ?? `Part ${part}`
}

export default function MockExamShell() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const partsParam   = searchParams.get('parts') ?? '5,6,7'
  const timeParam    = parseInt(searchParams.get('time') ?? '45')
  const parts        = partsParam.split(',').map(Number)
  const totalSeconds = timeParam * 60

  const [phase, setPhase]         = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex]         = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [answers, setAnswers]     = useState<Answer[]>([])
  const [timeLeft, setTimeLeft]   = useState(totalSeconds)
  const [partBreak, setPartBreak] = useState<number | null>(null)

  const sessionIdRef   = useRef<string | null>(null)
  const answersRef     = useRef<Answer[]>([])
  const questionsRef   = useRef<Question[]>([])
  const startTimeRef   = useRef<number>(Date.now())
  const qStartTimeRef  = useRef<number>(Date.now())
  const timerRef       = useRef<NodeJS.Timeout | null>(null)
  const submittedRef   = useRef(false)

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { questionsRef.current = questions }, [questions])

  const submitExam = useCallback(async (finalAnswers: Answer[], finalQuestions: Question[]) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setPhase('submitting')
    if (timerRef.current) clearInterval(timerRef.current)

    const sid = sessionIdRef.current
    if (sid) {
      const score = finalAnswers.filter(a => a.isCorrect).length
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000)
      await fetch(`/api/sessions/${sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, maxScore: finalQuestions.length, durationSec, answers: finalAnswers }),
      })
    }
    setPhase('results')
  }, [])

  useEffect(() => {
    async function load() {
      setPhase('loading')
      submittedRef.current = false
      const allQuestions: Question[] = []
      for (const part of parts) {
        const res = await fetch(`/api/questions?part=${part}`)
        const data = await res.json()
        allQuestions.push(...(data.questions ?? []))
      }
      if (allQuestions.length === 0) { setPhase('ready'); setQuestions([]); return }

      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'FULL_EXAM', parts, totalQuestions: allQuestions.length }),
      })
      const sessionData = await sessionRes.json()
      sessionIdRef.current = sessionData.id
      setQuestions(allQuestions)
      setPhase('ready')
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partsParam])

  useEffect(() => {
    if (phase !== 'exam') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          submitExam(answersRef.current, questionsRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, submitExam])

  useEffect(() => {
    qStartTimeRef.current = Date.now()
    setSelected(null)
  }, [index])

  function startExam() {
    startTimeRef.current = Date.now()
    qStartTimeRef.current = Date.now()
    setTimeLeft(totalSeconds)
    setIndex(0)
    setAnswers([])
    answersRef.current = []
    setPhase('exam')
  }

  function handleNext() {
    const q = questionsRef.current[index]
    const timeSpentSec = Math.round((Date.now() - qStartTimeRef.current) / 1000)
    const userAnswer = selected ?? ''
    const isCorrect  = userAnswer === q.answer
    const newAnswer: Answer = { questionId: q.id, userAnswer, isCorrect, timeSpentSec }
    const newAnswers = [...answersRef.current, newAnswer]
    setAnswers(newAnswers)
    answersRef.current = newAnswers

    const nextIndex = index + 1
    if (nextIndex >= questionsRef.current.length) {
      submitExam(newAnswers, questionsRef.current)
      return
    }
    const nextPart = questionsRef.current[nextIndex].part
    if (nextPart !== q.part && parts.length > 1) setPartBreak(nextPart)
    setIndex(nextIndex)
  }

  function dismissPartBreak() {
    setPartBreak(null)
    qStartTimeRef.current = Date.now()
  }

  if (phase === 'loading') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 80, textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 40px' }}>
          <p className="font-semibold" style={{ marginBottom: 8 }}>Prüfung wird vorbereitet…</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Fragen werden geladen</p>
        </div>
      </div>
    )
  }

  if (phase === 'ready' && questions.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 80 }}>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <AlertTriangle size={36} style={{ color: '#fbbf24', margin: '0 auto 16px' }} />
          <h2 className="text-xl font-bold" style={{ marginBottom: 8 }}>Keine Fragen verfügbar</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
            Für die gewählten Parts wurden keine Fragen gefunden.
          </p>
          <button onClick={() => router.push('/mock-exam')} className="btn-primary">Zurück zur Auswahl</button>
        </div>
      </div>
    )
  }

  if (phase === 'ready') {
    const byPart = parts.reduce<Record<number, number>>((acc, p) => {
      acc[p] = questions.filter(q => q.part === p).length
      return acc
    }, {})
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 60 }}>
        <div className="card" style={{ padding: '40px 36px' }}>
          <h2 className="text-2xl font-bold" style={{ marginBottom: 6 }}>Bereit?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
            Wenn du auf „Prüfung starten" klickst, läuft der Timer. Du erhältst kein Feedback während der Prüfung.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--card-border)' }}>
              <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{questions.length}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Fragen gesamt</p>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--card-border)' }}>
              <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{timeParam} min</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Zeitlimit</p>
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            {Object.entries(byPart).map(([p, count]) => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: 13 }}>{partLabel(Number(p))}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{count} Fragen</span>
              </div>
            ))}
          </div>
          <button onClick={startExam} className="btn-primary w-full" style={{ height: 48, fontSize: 15, fontWeight: 600 }}>
            Prüfung starten →
          </button>
          <button onClick={() => router.push('/mock-exam')}
            style={{ marginTop: 12, width: '100%', padding: '10px 0', color: 'var(--muted)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
            Zurück zur Auswahl
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 80, textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 40px' }}>
          <p className="font-semibold">Antworten werden eingereicht…</p>
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const correct = answers.filter(a => a.isCorrect).length
    const total   = questions.length
    const pct     = total > 0 ? Math.round(correct / total * 100) : 0
    const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    const estimatedScore = Math.round(pct * 9.9)
    const byPart = parts.reduce<Record<number, { correct: number; total: number }>>((acc, p) => {
      const partQs = questions.filter(q => q.part === p)
      const partAs = answers.filter(a => partQs.some(q => q.id === a.questionId))
      acc[p] = { correct: partAs.filter(a => a.isCorrect).length, total: partQs.length }
      return acc
    }, {})

    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 36px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>
            {pct >= 80 ? '🏆' : pct >= 60 ? '💪' : pct >= 40 ? '📚' : '🔄'}
          </div>
          <h2 className="text-3xl font-bold" style={{ marginBottom: 4 }}>{pct}%</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
            {correct} von {total} richtig · {Math.floor(durationSec / 60)}m {durationSec % 60}s
          </p>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 99, background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>~{estimatedScore} TOEIC-Punkte (geschätzt)</span>
          </div>
        </div>

        <h3 className="font-semibold" style={{ marginBottom: 14 }}>Ergebnis nach Part</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {Object.entries(byPart).map(([p, { correct: c, total: t }]) => {
            const pPct = t > 0 ? Math.round(c / t * 100) : 0
            return (
              <div key={p} className="card" style={{ padding: '16px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="font-medium text-sm">{partLabel(Number(p))}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c}/{t}</span>
                    <span className="font-bold" style={{ color: pPct >= 80 ? 'var(--success)' : pPct >= 60 ? '#fbbf24' : 'var(--error)' }}>{pPct}%</span>
                  </div>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pPct}%`, background: pPct >= 80 ? 'var(--success)' : pPct >= 60 ? '#fbbf24' : 'var(--error)' }} />
                </div>
              </div>
            )
          })}
        </div>

        <h3 className="font-semibold" style={{ marginBottom: 14 }}>Alle Antworten</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {questions.map((q, i) => {
            const ans = answers[i]
            if (!ans) return null
            const opts = getOptions(q)
            const text = getQuestionText(q)
            const passage = getPassage(q)
            return (
              <div key={q.id} className="card" style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {ans.isCorrect
                    ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    : <XCircle    size={16} style={{ color: 'var(--error)',   flexShrink: 0, marginTop: 2 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: 'var(--card-border)', color: 'var(--muted)' }}>
                        Part {q.part} · #{i + 1}
                      </span>
                      {!ans.isCorrect && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                          Deine Antwort: <strong style={{ color: 'var(--error)' }}>{ans.userAnswer || '—'}</strong>
                          {' · '}Richtig: <strong style={{ color: 'var(--success)' }}>{q.answer}</strong>
                        </span>
                      )}
                    </div>
                    {passage && <p className="text-xs" style={{ color: 'var(--muted)', marginBottom: 6, fontStyle: 'italic', lineHeight: 1.5 }}>{passage.length > 120 ? passage.slice(0, 120) + '…' : passage}</p>}
                    {text && <p className="text-sm" style={{ lineHeight: 1.5, marginBottom: 8 }}>{text}</p>}
                    {Object.keys(opts).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {Object.entries(opts).map(([key, val]) => {
                          const isCorrectOpt = key === q.answer
                          const isUserOpt    = key === ans.userAnswer
                          return (
                            <span key={key} style={{
                              fontSize: 11, padding: '2px 10px', borderRadius: 99,
                              fontWeight: isCorrectOpt || isUserOpt ? 700 : 400,
                              background: isCorrectOpt ? 'rgba(74,222,128,0.15)' : isUserOpt && !isCorrectOpt ? 'rgba(248,113,113,0.15)' : 'var(--card-border)',
                              color: isCorrectOpt ? 'var(--success)' : isUserOpt && !isCorrectOpt ? 'var(--error)' : 'var(--muted)',
                              border: `1px solid ${isCorrectOpt ? 'var(--success)' : isUserOpt && !isCorrectOpt ? 'var(--error)' : 'transparent'}`,
                            }}>{key}: {val}</span>
                          )
                        })}
                      </div>
                    )}
                    {q.explanation && <p className="text-xs" style={{ marginTop: 8, color: 'var(--muted)', lineHeight: 1.5 }}><strong style={{ color: 'var(--accent)' }}>Erklärung:</strong> {q.explanation}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <button onClick={() => router.push('/mock-exam')} className="btn-primary">Neuer Mock-Exam</button>
          <button onClick={() => router.push('/progress')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            <BarChart2 size={14} /> Fortschritt ansehen
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'exam' && partBreak !== null) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto 0' }}>
        <div style={{ position: 'fixed', top: 16, right: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: timeLeft < 300 ? 'rgba(248,113,113,0.15)' : 'var(--card)', border: `1px solid ${timeLeft < 300 ? 'var(--error)' : 'var(--card-border)'}`, zIndex: 100 }}>
          <Clock size={14} style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--muted)' }} />
          <span className="font-mono font-bold" style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--foreground)' }}>{formatTime(timeLeft)}</span>
        </div>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <h2 className="text-xl font-bold" style={{ marginBottom: 8 }}>{partLabel(partBreak)}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>Du wechselst jetzt zum nächsten Abschnitt.</p>
          <button onClick={dismissPartBreak} className="btn-primary w-full" style={{ height: 48 }}>
            Weiter <ChevronRight size={16} style={{ display: 'inline', marginLeft: 4 }} />
          </button>
        </div>
      </div>
    )
  }

  const q = questions[index]
  if (!q) return null
  const opts = getOptions(q)
  const hasOptions = Object.keys(opts).length > 0
  const questionText = getQuestionText(q)
  const passage = getPassage(q)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 8 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', marginBottom: 20, background: 'var(--background)', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-semibold text-sm">{partLabel(q.part)}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Frage {index + 1} / {questions.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: timeLeft < 300 ? 'rgba(248,113,113,0.15)' : 'var(--card-border)', border: `1px solid ${timeLeft < 300 ? 'var(--error)' : 'transparent'}` }}>
          <Clock size={14} style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--muted)' }} />
          <span className="font-mono font-bold text-sm" style={{ color: timeLeft < 300 ? 'var(--error)' : 'var(--foreground)' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'var(--card-border)', marginBottom: 24 }}>
        <div className="h-full rounded-full" style={{ width: `${(index / questions.length) * 100}%`, background: 'var(--accent)', transition: 'width 0.3s ease' }} />
      </div>

      <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
        {passage && (
          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 16, marginBottom: 18 }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Text</p>
            <p className="text-sm" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{passage.length > 500 ? passage.slice(0, 500) + '…' : passage}</p>
          </div>
        )}
        {questionText && <p className="text-sm font-medium" style={{ lineHeight: 1.7, marginBottom: hasOptions ? 20 : 0 }}>{questionText}</p>}
        {hasOptions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(opts).map(([key, text]) => {
              const isChosen = selected === key
              return (
                <button key={key} onClick={() => setSelected(key)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 10, width: '100%', border: `2px solid ${isChosen ? 'var(--accent)' : 'var(--card-border)'}`, background: isChosen ? 'var(--accent-subtle)' : 'transparent', textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s' }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isChosen ? 'var(--accent)' : 'var(--card-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isChosen ? 'var(--accent)' : 'var(--muted)' }}>{key}</span>
                  <span className="text-sm" style={{ lineHeight: 1.5 }}>{text}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {selected ? '✓ Antwort ausgewählt' : 'Keine Auswahl — wird als falsch gewertet'}
        </p>
        <button onClick={handleNext} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {index + 1 >= questions.length ? 'Abgeben' : 'Weiter'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}