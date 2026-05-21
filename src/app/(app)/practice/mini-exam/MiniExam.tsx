'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, AlertTriangle } from 'lucide-react'

interface Option { [key: string]: string }
interface Question {
  id: string
  part: number
  content: { question?: string; passage?: string; text?: string }
  options: Option | string[]
  answer: string
  explanation: string | null
}

interface Answer { questionId: string; userAnswer: string; isCorrect: boolean; timeSpentSec: number }

const EXAM_CONFIG = {
  parts: [1, 2, 3, 4, 5, 6, 7] as const,
  questionsPerPart: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 5, 6: 3, 7: 3 } as const,
  totalTime: 20 * 60, // 20 minutes
  partNames: {
    1: 'Part 1 — Photographs',
    2: 'Part 2 — Question-Response',
    3: 'Part 3 — Short Conversations',
    4: 'Part 4 — Short Talks',
    5: 'Part 5 — Incomplete Sentence',
    6: 'Part 6 — Text Completion',
    7: 'Part 7 — Reading Comprehension',
  } as const,
  partColors: { 1: '#04FF88', 2: '#04FF88', 3: '#04FF88', 4: '#04FF88', 5: '#D5FD44', 6: '#D5FD44', 7: '#D5FD44' } as const,
}

const LETTERS = ['A', 'B', 'C', 'D']

type Phase = 'intro' | 'exam' | 'results'

function getListeningContent(content: { question?: string; passage?: string; text?: string }, part: number): { audioText: string | null; mainQuestion: string | null } {
  const c = content as Record<string, unknown>
  if (part === 1) {
    const transcript = c.transcript as string[] | undefined
    return { audioText: transcript ? transcript.map((t, i) => `${['A','B','C','D'][i]}. ${t}`).join('\n') : null, mainQuestion: 'Welche Aussage beschreibt das Foto?' }
  }
  if (part === 2) {
    const q = c.question as string | undefined
    const responses = c.responses as string[] | undefined
    const responseText = responses ? responses.map((r, i) => `${['A','B','C'][i]}. ${r}`).join('\n') : null
    return { audioText: responseText ? `Frage: ${q}\n\n${responseText}` : q ?? null, mainQuestion: q ?? null }
  }
  if (part === 3 || part === 4) {
    const dialogue = c.dialogue as { speaker: string; line: string }[] | undefined
    const transcript = c.transcript as string | undefined
    const talk = c.talk as string | undefined
    const audioText = dialogue
      ? dialogue.map(d => `${d.speaker}: ${d.line}`).join('\n')
      : (transcript ?? talk ?? null)
    return { audioText, mainQuestion: null }
  }
  return { audioText: null, mainQuestion: content.question ?? content.text ?? null }
}

export default function MiniExam() {
  const router = useRouter()
  const [phase, setPhase]           = useState<Phase>('intro')
  const [questions, setQuestions]   = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected]     = useState<string | null>(null)
  const [submitted, setSubmitted]   = useState(false)
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [timeLeft, setTimeLeft]     = useState(EXAM_CONFIG.totalTime)
  const [loading, setLoading]       = useState(false)
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const questionStartRef            = useRef(Date.now())

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return
    if (timeLeft <= 0) { finishExam(); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const all: Question[] = []
    for (const part of EXAM_CONFIG.parts) {
      const limit = EXAM_CONFIG.questionsPerPart[part]
      const res  = await fetch(`/api/questions?part=${part}&adaptive=true&limit=${limit}`)
      const data = await res.json()
      all.push(...data.questions)
    }
    setQuestions(all)

    const sessRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'FULL_EXAM',
        parts: EXAM_CONFIG.parts,
        totalQuestions: all.length,
      }),
    })
    const sessData = await sessRes.json()
    setSessionId(sessData.id ?? null)
    setLoading(false)
  }, [])

  function startExam() {
    setPhase('exam')
    setCurrentIdx(0)
    setAnswers([])
    setTimeLeft(EXAM_CONFIG.totalTime)
    questionStartRef.current = Date.now()
  }

  function handleSelect(letter: string) {
    if (!submitted) setSelected(letter)
  }

  function handleSubmit() {
    if (!selected || submitted) return
    const q = questions[currentIdx]
    const isCorrect = selected === q.answer
    const timeSpentSec = Math.round((Date.now() - questionStartRef.current) / 1000)
    const newAnswer: Answer = { questionId: q.id, userAnswer: selected, isCorrect, timeSpentSec }
    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)
    setSubmitted(true)

    if (currentIdx === questions.length - 1) {
      finishExam(newAnswers)
    }
  }

  function handleNext() {
    setSelected(null)
    setSubmitted(false)
    setCurrentIdx(i => i + 1)
    questionStartRef.current = Date.now()
  }

  async function finishExam(finalAnswers?: Answer[]) {
    const ans = finalAnswers ?? answers
    setPhase('results')
    if (!sessionId) return
    const score = ans.filter(a => a.isCorrect).length
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, maxScore: questions.length, durationSec: EXAM_CONFIG.totalTime - timeLeft, answers: ans }),
    })
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const timerColor = timeLeft < 120 ? '#ef4444' : timeLeft < 300 ? '#fbbf24' : 'var(--success)'

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Mini-Exam</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Prüfungssimulation mit Timer</p>
        </div>

        <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p className="font-semibold">20 Minuten · {Object.values(EXAM_CONFIG.questionsPerPart).reduce((a, b) => a + b, 0)} Fragen</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Listening Parts 1–4 + Reading Parts 5–7</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {EXAM_CONFIG.parts.map(part => (
              <div key={part} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: `${EXAM_CONFIG.partColors[part]}10`, border: `1px solid ${EXAM_CONFIG.partColors[part]}25` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: EXAM_CONFIG.partColors[part] }}>{EXAM_CONFIG.partNames[part]}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{EXAM_CONFIG.questionsPerPart[part]} Fragen</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)', marginBottom: 24, display: 'flex', gap: 10 }}>
            <AlertTriangle size={15} style={{ color: '#fb923c', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Der Timer startet sofort. Schreibe keine Notizen — versuche, die Fragen so schnell wie möglich zu beantworten, so wie in der echten Prüfung.
            </p>
          </div>

          <button
            onClick={async () => { await loadQuestions(); startExam() }}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? 'Fragen werden geladen…' : '⏱ Prüfung starten'}
          </button>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const score   = answers.filter(a => a.isCorrect).length
    const total   = questions.length
    const pct     = total > 0 ? Math.round(score / total * 100) : 0
    const timeTaken = EXAM_CONFIG.totalTime - timeLeft
    const pctColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : '#ef4444'

    // Per-part breakdown
    const partBreakdown = EXAM_CONFIG.parts.map(part => {
      const partQs  = questions.filter(q => q.part === part)
      const partAns = answers.filter(a => partQs.some(q => q.id === a.questionId))
      const correct = partAns.filter(a => a.isCorrect).length
      return { part, correct, total: partQs.length, pct: partQs.length > 0 ? Math.round(correct / partQs.length * 100) : 0 }
    })

    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Ergebnis</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Mini-Exam abgeschlossen · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
        </div>

        {/* Score */}
        <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 72, fontWeight: 800, color: pctColor, lineHeight: 1, marginBottom: 8 }}>{pct}%</p>
          <p className="text-lg font-semibold" style={{ marginBottom: 4 }}>{score} von {total} richtig</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {pct >= 80 ? '🏆 Ausgezeichnet! Prüfungsreifes Niveau.' : pct >= 60 ? '💪 Gut! Weiter üben für Prüfungssicherheit.' : '📚 Weiter üben — Fokus auf die schwächsten Parts.'}
          </p>
        </div>

        {/* Per-part breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {partBreakdown.map(({ part, correct, total: t, pct: p }) => (
            <div key={part} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${EXAM_CONFIG.partColors[part]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: EXAM_CONFIG.partColors[part] }}>P{part}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="text-sm font-medium">{EXAM_CONFIG.partNames[part].split('—')[1]?.trim()}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p >= 80 ? 'var(--success)' : p >= 60 ? '#fbbf24' : '#ef4444' }}>{correct}/{t} · {p}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: EXAM_CONFIG.partColors[part], width: `${p}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Q&A review */}
        <details style={{ marginBottom: 24 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 10 }}>
            Alle Fragen überprüfen →
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {questions.map((q, i) => {
              const ans   = answers[i]
              const opts  = Array.isArray(q.options) ? q.options : Object.values(q.options)
              return (
                <div key={q.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    {ans?.isCorrect
                      ? <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                      : <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />}
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{q.content.question ?? q.content.text ?? `Frage ${i + 1}`}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: q.explanation ? 8 : 0 }}>
                    {opts.map((opt, j) => {
                      const letter = LETTERS[j]
                      const isCorrect = letter === q.answer
                      const isUser    = letter === ans?.userAnswer
                      return (
                        <span key={j} style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 99,
                          background: isCorrect ? 'rgba(74,222,128,0.15)' : isUser && !isCorrect ? 'rgba(239,68,68,0.12)' : 'var(--card-border)',
                          color: isCorrect ? 'var(--success)' : isUser && !isCorrect ? '#ef4444' : 'var(--muted)',
                          fontWeight: isCorrect || isUser ? 700 : 400,
                        }}>
                          {letter}: {opt}
                        </span>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </details>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setPhase('intro'); setAnswers([]); setQuestions([]) }}
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

  // ── Exam ──────────────────────────────────────────────────────────────────
  if (questions.length === 0) return null
  const q    = questions[currentIdx]
  // For Part 1, real option texts come from content.transcript, not the options field
  const getOpts = (question: Question): string[] => {
    if (question.part === 1) {
      const tr = (question.content as Record<string, unknown>).transcript as string[] | undefined
      if (tr && tr.length > 0) return tr
    }
    const raw = question.options
    return Array.isArray(raw) ? raw : Object.values(raw as Option)
  }
  const opts = getOpts(q)
  const content = q.content
  const partProgress = { done: currentIdx, total: questions.length }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: EXAM_CONFIG.partColors[q.part as 1|2|3|4|5|6|7] }}>
            Part {q.part}
          </span>
          <span style={{ color: 'var(--card-border)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{currentIdx + 1} / {questions.length}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99,
          background: timeLeft < 120 ? 'rgba(239,68,68,0.1)' : 'var(--card-border)',
          border: `1px solid ${timerColor}40`,
        }}>
          <Clock size={13} style={{ color: timerColor }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${(partProgress.done / partProgress.total) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        {/* Listening audio content (shown as text in exam mode) */}
        {[1, 2, 3, 4].includes(q.part) && (() => {
          const { audioText } = getListeningContent(content, q.part)
          return audioText ? (
            <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: 'rgba(4,255,136,0.06)', border: '1px solid rgba(4,255,136,0.25)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#04FF88', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🎧 Im echten TOEIC wird dieser Text vorgelesen
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--fg)' }}>{audioText}</p>
            </div>
          ) : null
        })()}
        {content.passage && (
          <div style={{ padding: '14px 18px', marginBottom: 18, borderRadius: 8, background: 'var(--background)', borderLeft: '3px solid var(--accent)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--muted)', marginBottom: 6 }}>Passage</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{content.passage}</p>
          </div>
        )}
        <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>
          {[1, 2, 3, 4].includes(q.part)
            ? (getListeningContent(content, q.part).mainQuestion ?? content.question ?? content.text ?? `Frage ${currentIdx + 1}`)
            : (content.question ?? content.text ?? `Frage ${currentIdx + 1}`)}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {opts.map((opt, i) => {
            const letter    = LETTERS[i]
            const isSelected = selected === letter
            const isCorrect  = submitted && letter === q.answer
            const isWrong    = submitted && isSelected && !isCorrect
            return (
              <button key={i} disabled={submitted} onClick={() => handleSelect(letter)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                  borderRadius: 10, border: `1.5px solid ${isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--card-border)'}`,
                  background: isCorrect ? 'rgba(74,222,128,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : isSelected ? 'var(--accent-subtle)' : 'transparent',
                  cursor: submitted ? 'default' : 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s',
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--card-border)',
                  color: (isCorrect || isWrong || isSelected) ? '#fff' : 'var(--muted)',
                }}>
                  {letter}
                </span>
                <span style={{ fontSize: 14, color: isCorrect ? 'var(--success)' : isWrong ? '#ef4444' : 'var(--fg)' }}>{opt}</span>
              </button>
            )
          })}
        </div>

        {submitted && q.explanation && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>Erklärung</p>
            <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {submitted && (
              <span style={{ fontSize: 13, fontWeight: 600, color: answers[answers.length - 1]?.isCorrect ? 'var(--success)' : '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                {answers[answers.length - 1]?.isCorrect
                  ? <><CheckCircle size={15} /> Richtig!</>
                  : <><XCircle size={15} /> Falsch — Antwort: {q.answer}</>}
              </span>
            )}
          </div>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!selected} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
              Antworten
            </button>
          ) : (
            <button onClick={currentIdx < questions.length - 1 ? handleNext : () => finishExam()}
              className="btn-primary" style={{ fontSize: 14, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {currentIdx < questions.length - 1 ? <><ChevronRight size={15} /> Weiter</> : <><Trophy size={15} /> Ergebnis</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
