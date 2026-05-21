'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Headphones, BookOpen, AlertTriangle, Play } from 'lucide-react'
import { accuracyToListeningScore, accuracyToReadingScore } from '@/lib/toeicScore'

interface Question {
  id: string
  part: number
  section: string
  content: Record<string, unknown>
  options: string[] | null
  answer: string
  explanation: string | null
  tags: string[]
}

interface Answer { questionId: string; userAnswer: string; isCorrect: boolean; timeSpentSec: number; part: number }

const LISTENING_PARTS = [1, 2, 3, 4]
const READING_PARTS   = [5, 6, 7]
const LISTENING_TIME  = 45 * 60  // 45 minutes
const READING_TIME    = 75 * 60  // 75 minutes

const PART_LIMITS: Record<number, number> = { 1: 6, 2: 25, 3: 13, 4: 10, 5: 30, 6: 8, 7: 20 }
const PART_NAMES: Record<number, string> = {
  1: 'Part 1 — Photographs', 2: 'Part 2 — Question-Response',
  3: 'Part 3 — Conversations', 4: 'Part 4 — Short Talks',
  5: 'Part 5 — Incomplete Sentences', 6: 'Part 6 — Text Completion',
  7: 'Part 7 — Reading Comprehension',
}

type Phase = 'intro' | 'listening' | 'reading-intro' | 'reading' | 'results'
const LETTERS = ['A', 'B', 'C', 'D']

function fmt(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function TimerBar({ timeLeft, total, color }: { timeLeft: number; total: number; color: string }) {
  const pct = (timeLeft / total) * 100
  const isLow = timeLeft < 300
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Clock size={14} style={{ color: isLow ? '#ef4444' : color, flexShrink: 0 }} />
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: isLow ? '#ef4444' : color, width: `${pct}%`, transition: 'width 1s linear' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: isLow ? '#ef4444' : color, fontVariantNumeric: 'tabular-nums', minWidth: 42 }}>
        {fmt(timeLeft)}
      </span>
    </div>
  )
}

export default function FullExam() {
  const router = useRouter()
  const [phase, setPhase]           = useState<Phase>('intro')
  const [listeningQs, setListeningQs] = useState<Question[]>([])
  const [readingQs, setReadingQs]   = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected]     = useState<string | null>(null)
  const [submitted, setSubmitted]   = useState(false)
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [listeningTime, setListeningTime] = useState(LISTENING_TIME)
  const [readingTime, setReadingTime]     = useState(READING_TIME)
  const [loading, setLoading]       = useState(false)
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const questionStartRef            = useRef(Date.now())
  const [timesUp, setTimesUp]       = useState(false)

  const currentQuestions = phase === 'listening' ? listeningQs : readingQs
  const question         = currentQuestions[currentIdx]
  const isLastQ          = currentIdx === currentQuestions.length - 1

  // Listening timer
  useEffect(() => {
    if (phase !== 'listening') return
    if (listeningTime <= 0) { setTimesUp(true); moveToReadingIntro(); return }
    const t = setTimeout(() => setListeningTime(s => s - 1), 1000)
    return () => clearTimeout(t)
  })

  // Reading timer
  useEffect(() => {
    if (phase !== 'reading') return
    if (readingTime <= 0) { setTimesUp(true); finishExam(); return }
    const t = setTimeout(() => setReadingTime(s => s - 1), 1000)
    return () => clearTimeout(t)
  })

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const lqs: Question[] = []
    const rqs: Question[] = []
    for (const part of [...LISTENING_PARTS, ...READING_PARTS]) {
      const limit = PART_LIMITS[part] ?? 10
      const res  = await fetch(`/api/questions?part=${part}&adaptive=true&limit=${limit}`)
      const data = await res.json()
      if (LISTENING_PARTS.includes(part)) lqs.push(...data.questions)
      else rqs.push(...data.questions)
    }
    setListeningQs(lqs)
    setReadingQs(rqs)

    const sessRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'FULL_EXAM', parts: [1,2,3,4,5,6,7], totalQuestions: lqs.length + rqs.length }),
    })
    const sessData = await sessRes.json()
    setSessionId(sessData.id ?? null)
    setLoading(false)
  }, [])

  function startListening() {
    setPhase('listening')
    setCurrentIdx(0)
    setAnswers([])
    setListeningTime(LISTENING_TIME)
    setTimesUp(false)
    questionStartRef.current = Date.now()
  }

  function moveToReadingIntro() {
    setPhase('reading-intro')
    setCurrentIdx(0)
    setSelected(null)
    setSubmitted(false)
  }

  function startReading() {
    setPhase('reading')
    setCurrentIdx(0)
    setReadingTime(READING_TIME)
    setTimesUp(false)
    questionStartRef.current = Date.now()
  }

  function finishExam() {
    const allAnswers = [...answers]
    if (sessionId) {
      const lAnswers = allAnswers.filter(a => LISTENING_PARTS.includes(a.part))
      const rAnswers = allAnswers.filter(a => READING_PARTS.includes(a.part))
      const score    = allAnswers.filter(a => a.isCorrect).length
      const maxScore = listeningQs.length + readingQs.length
      const durationSec = LISTENING_TIME - listeningTime + READING_TIME - readingTime
      fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, maxScore, durationSec, answers: allAnswers }),
      })
      void lAnswers
      void rAnswers
    }
    setPhase('results')
  }

  function handleSubmit() {
    if (!selected || !question) return
    const timeSpentSec = Math.round((Date.now() - questionStartRef.current) / 1000)
    const isCorrect = selected === question.answer
    setAnswers(prev => [...prev, { questionId: question.id, userAnswer: selected, isCorrect, timeSpentSec, part: question.part }])
    setSubmitted(true)
  }

  function handleNext() {
    if (!question) return
    // Auto-submit if not submitted (time pressure)
    if (!submitted && selected) { handleSubmit(); return }
    if (!submitted) {
      // Skip unanswered
      const timeSpentSec = Math.round((Date.now() - questionStartRef.current) / 1000)
      setAnswers(prev => [...prev, { questionId: question.id, userAnswer: '', isCorrect: false, timeSpentSec, part: question.part }])
    }
    setSelected(null)
    setSubmitted(false)
    questionStartRef.current = Date.now()
    if (isLastQ) {
      if (phase === 'listening') moveToReadingIntro()
      else finishExam()
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  // ── Intro ───────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>TOEIC Vollprüfung</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Originalgetreue Simulation mit echter Zeitbegrenzung</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            { icon: Headphones, color: '#04FF88', title: 'Listening', sub: '45 Minuten', detail: 'Parts 1–4' },
            { icon: BookOpen, color: '#D5FD44', title: 'Reading', sub: '75 Minuten', detail: 'Parts 5–7' },
          ].map(({ icon: Icon, color, title, sub, detail }) => (
            <div key={title} className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{sub}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>Prüfungsbedingungen</p>
              <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 0, listStyle: 'none' }}>
                <li>› Listening und Reading laufen nacheinander — kein Skip zwischen Parts möglich</li>
                <li>› Timer läuft ununterbrochen — bei Ablauf endet der jeweilige Abschnitt automatisch</li>
                <li>› Fragen können nicht zurückgegangen werden</li>
                <li>› Ergebnis: separater L-Score und R-Score (5–495 je)</li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={async () => { await loadQuestions(); startListening() }}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
          {loading ? 'Lädt Fragen...' : <><Play size={18} /> Prüfung starten</>}
        </button>
      </div>
    )
  }

  // ── Reading intro (between sections) ───────────────────────────────────────
  if (phase === 'reading-intro') {
    const lAnswers = answers.filter(a => LISTENING_PARTS.includes(a.part))
    const lCorrect = lAnswers.filter(a => a.isCorrect).length
    const lPct = listeningQs.length ? Math.round(lCorrect / listeningQs.length * 100) : 0
    const lScore = accuracyToListeningScore(lCorrect / Math.max(1, listeningQs.length))
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#04FF88', marginBottom: 4 }}>{lScore}</div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Geschätzter Listening-Score (5–495)</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>{lCorrect} von {listeningQs.length} richtig · {lPct}%</p>
        </div>
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Listening abgeschlossen</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Jetzt beginnt der Reading-Abschnitt. Du hast <strong>75 Minuten</strong> für Parts 5, 6 und 7.
            Der Timer startet sofort wenn du auf den Button klickst.
          </p>
        </div>
        <button onClick={startReading} className="btn-primary flex items-center gap-2" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
          <BookOpen size={18} /> Reading starten (75 Min)
        </button>
      </div>
    )
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const lAnswers = answers.filter(a => LISTENING_PARTS.includes(a.part))
    const rAnswers = answers.filter(a => READING_PARTS.includes(a.part))
    const lCorrect = lAnswers.filter(a => a.isCorrect).length
    const rCorrect = rAnswers.filter(a => a.isCorrect).length
    const lScore = accuracyToListeningScore(lCorrect / Math.max(1, listeningQs.length))
    const rScore = accuracyToReadingScore(rCorrect / Math.max(1, readingQs.length))
    const total  = lScore + rScore
    const totalMax = 990

    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 24 }}>Prüfungsergebnis</h1>
        <div className="card" style={{ padding: '32px 36px', marginBottom: 20, textAlign: 'center' }}>
          <Trophy size={36} style={{ color: '#fbbf24', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}>{total}</div>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Geschätzter TOEIC-Gesamtscore (10–990)</p>
          <div style={{ height: 10, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #04FF88, #D5FD44)', width: `${(total / totalMax) * 100}%` }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Listening', score: lScore, correct: lCorrect, total: listeningQs.length, color: '#04FF88' },
            { label: 'Reading',   score: rScore, correct: rCorrect, total: readingQs.length,   color: '#D5FD44' },
          ].map(({ label, score, correct, total: tot, color }) => (
            <div key={label} className="card" style={{ padding: '20px 22px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 36, fontWeight: 800, color, marginBottom: 4 }}>{score}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{correct} / {tot} richtig ({tot ? Math.round(correct/tot*100) : 0}%)</p>
            </div>
          ))}
        </div>

        {timesUp && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#ef4444' }}>⏰ Zeit abgelaufen — die Prüfung wurde automatisch beendet.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/practice/full-exam')} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> Nochmal
          </button>
          <button onClick={() => router.push('/progress')}
            style={{ padding: '0 20px', height: 44, borderRadius: 10, border: '1px solid var(--card-border)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Fortschritt ansehen
          </button>
        </div>
      </div>
    )
  }

  // ── Exam (listening or reading) ─────────────────────────────────────────────
  if (!question) return <div style={{ maxWidth: 640, margin: '0 auto', padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Keine Fragen verfügbar.</div>

  const opts = (question.options as string[] | null) ?? []
  const content = question.content as Record<string, unknown>
  const passage  = (content.passage ?? content.text ?? '') as string
  const passages = content.passages as { title?: string; text: string }[] | undefined

  const isListening = phase === 'listening'
  const timeLeft    = isListening ? listeningTime : readingTime
  const totalTime   = isListening ? LISTENING_TIME : READING_TIME
  const sectionColor = isListening ? '#04FF88' : '#D5FD44'

  const displayText: string = (() => {
    if (question.part === 3 || question.part === 4) {
      const dialogue = content.dialogue as { speaker: string; line: string }[] | undefined
      const transcript = content.transcript as string | undefined
      const talk = content.talk as string | undefined
      if (dialogue) return dialogue.map(d => `${d.speaker}: ${d.line}`).join('\n')
      return transcript ?? talk ?? ''
    }
    if (question.part === 1) {
      const transcript = content.transcript as string[] | undefined
      return transcript ? transcript.map((t, i) => `${LETTERS[i]}. ${t}`).join('\n') : ''
    }
    if (question.part === 2) {
      const q = content.question as string | undefined
      const responses = content.responses as string[] | undefined
      return responses ? `Frage: ${q ?? ''}\n\n${responses.map((r, i) => `${['A','B','C'][i]}. ${r}`).join('\n')}` : (q ?? '')
    }
    return ''
  })()

  const questionText = content.question as string ?? content.text as string ?? ''

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isListening ? <Headphones size={16} style={{ color: sectionColor }} /> : <BookOpen size={16} style={{ color: sectionColor }} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: sectionColor }}>
              {isListening ? 'Listening' : 'Reading'} — {PART_NAMES[question.part]}
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{currentIdx + 1} / {currentQuestions.length}</span>
        </div>
        <TimerBar timeLeft={timeLeft} total={totalTime} color={sectionColor} />
      </div>

      <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', borderRadius: 99, background: sectionColor, width: `${(currentIdx / currentQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <div className="card" style={{ padding: '24px 28px' }}>
        {/* Listening transcript display */}
        {isListening && displayText && (
          <div style={{ marginBottom: 18, padding: '14px 16px', borderRadius: 10, background: 'var(--background)', borderLeft: '3px solid #04FF88', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--muted)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#04FF88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Transkript (nur zu Übungszwecken)</p>
            {displayText}
          </div>
        )}

        {/* Reading passage */}
        {!isListening && passages && passages.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            {passages.map((p, i) => (
              <div key={i} style={{ marginBottom: i < passages.length - 1 ? 14 : 0, padding: '14px 16px', borderRadius: 10, background: 'var(--background)', borderLeft: '3px solid var(--accent)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {p.title && <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.title}</p>}
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        )}
        {!isListening && !passages && passage && (
          <div style={{ marginBottom: 18, padding: '14px 16px', borderRadius: 10, background: 'var(--background)', borderLeft: '3px solid var(--accent)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {passage}
          </div>
        )}

        <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>{questionText}</p>

        {opts.length === 0 && isListening && (
          <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(4,255,136,0.06)', border: '1px solid rgba(4,255,136,0.2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: '#04FF88' }}>Audio-Frage — </span>
            Im echten TOEIC wird diese Frage vorgelesen. Hier als Transkript dargestellt. Klicke <strong>Weiter</strong> um fortzufahren.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {opts.map((opt, i) => {
            const letter = LETTERS[i]
            const isSelected = selected === letter
            const isCorrect  = submitted && letter === question.answer
            const isWrong    = submitted && isSelected && letter !== question.answer

            let borderColor = 'var(--card-border)'
            let bg = 'transparent'
            let textColor = 'var(--foreground)'

            if (!submitted && isSelected) { borderColor = sectionColor; bg = `${sectionColor}15` }
            if (isCorrect)  { borderColor = 'var(--success)'; bg = 'rgba(34,197,94,0.1)'; textColor = 'var(--success)' }
            if (isWrong)    { borderColor = 'var(--error)';   bg = 'rgba(239,68,68,0.1)';  textColor = 'var(--error)' }

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(letter)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left border"
                style={{ borderColor, background: bg, color: textColor, cursor: submitted ? 'default' : 'pointer' }}>
                <span className="w-7 h-7 rounded shrink-0 flex items-center justify-center text-sm font-semibold"
                  style={{ background: 'var(--card-border)', color: textColor }}>{letter}</span>
                <span style={{ fontSize: 14 }}>{opt}</span>
              </button>
            )
          })}
        </div>

        {submitted && question.explanation && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', marginBottom: 16, fontSize: 13, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Erklärung: </span>
            {question.explanation}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {submitted ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: answers.at(-1)?.isCorrect ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {answers.at(-1)?.isCorrect
                ? <><CheckCircle size={15} /> Richtig</>
                : <><XCircle size={15} /> Falsch — Richtig: {question.answer}</>}
            </span>
          ) : <span />}
          <div style={{ display: 'flex', gap: 8 }}>
            {!submitted && opts.length > 0 && (
              <button onClick={handleSubmit} disabled={!selected} className="btn-primary">
                Prüfen
              </button>
            )}
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              {isLastQ ? (isListening ? 'Reading starten' : 'Ergebnis') : 'Weiter'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
