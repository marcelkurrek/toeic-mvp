'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Volume2, ChevronRight, CheckCircle, XCircle, RotateCcw, Eye, EyeOff, TrendingUp } from 'lucide-react'

type ListeningPart = 1 | 2 | 3 | 4
type Phase = 'loading' | 'prereading' | 'ready' | 'playing' | 'answering' | 'submitted' | 'finished'

interface Question {
  id: string
  part: number
  type: string
  content: Record<string, unknown>
  options: string[] | null
  answer: string
  explanation: string | null
}

interface Answer { questionId: string; selected: string; correct: boolean; timeSpentSec: number }

function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) setSupported(false)
  }, [])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!supported || typeof window === 'undefined') { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = 0.92
    utt.pitch = 1
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => { setSpeaking(false); onEnd?.() }
    utt.onerror = () => { setSpeaking(false); onEnd?.() }
    utteranceRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [supported])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking, supported }
}

function useTimer(initialSecs: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(initialSecs)
  useEffect(() => { setRemaining(initialSecs) }, [initialSecs])
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(id); onEnd(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, onEnd])
  return remaining
}

// Build TTS script for each part type
function buildScript(question: Question, part: ListeningPart): string {
  const c = question.content as Record<string, unknown>
  if (part === 1) {
    const lines = (c.transcript as string[]) ?? []
    return lines.map((t, i) => `${['A', 'B', 'C', 'D'][i]}. ${t}`).join('. ... ')
  }
  if (part === 2) {
    const q = (c.question as string) ?? ''
    const opts = (question.options as string[]) ?? []
    const lines = (c.responses ?? opts) as string[]
    return `${q} ... A. ${lines[0]}. B. ${lines[1]}. C. ${lines[2]}.`
  }
  if (part === 3) {
    const dialogue = c.dialogue as { speaker: string; line: string }[] | undefined
    if (dialogue) return dialogue.map(d => `${d.speaker}: ${d.line}`).join('. ... ')
    return (c.transcript as string) ?? ''
  }
  if (part === 4) {
    return (c.transcript as string) ?? (c.talk as string) ?? ''
  }
  return ''
}

function ProgressBar({ current, total, color = 'var(--accent)' }: { current: number; total: number; color?: string }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ height: '100%', borderRadius: 99, background: color, width: `${(current / total) * 100}%`, transition: 'width 0.3s' }} />
    </div>
  )
}

interface Part1Props { question: Question; onAnswer: (sel: string) => void; submitted: boolean; selected: string | null }
function Part1View({ question, onAnswer, submitted, selected }: Part1Props) {
  const c = question.content as Record<string, unknown>
  const { speak, speaking, supported } = useTTS()
  const [played, setPlayed] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const transcript = (c.transcript as string[]) ?? []
  const correct = question.answer

  const handlePlay = () => {
    setPlayed(true)
    const script = buildScript(question, 1)
    speak(script, () => setShowOptions(true))
  }

  return (
    <div>
      {c.imageUrl && (
        <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', maxHeight: 320 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.imageUrl as string} alt="TOEIC Part 1" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
        </div>
      )}
      {!played && (
        <button onClick={handlePlay} disabled={!supported}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 10, background: '#04FF8820', border: '1.5px solid #04FF8850', color: '#04FF88', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <Play size={16} /> {supported ? 'Aussagen abspielen' : 'TTS nicht verfügbar — Transkript anzeigen'}
        </button>
      )}
      {speaking && <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}><Volume2 size={13} style={{ display: 'inline', marginRight: 6 }} />Wird abgespielt…</p>}
      {(showOptions || submitted) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['A', 'B', 'C', 'D'].map((letter, i) => {
            const isSelected = selected === letter
            const isCorrect = correct === letter
            const bg = submitted
              ? isCorrect ? 'rgba(74,222,128,0.15)' : isSelected ? 'rgba(239,68,68,0.12)' : 'transparent'
              : isSelected ? 'rgba(99,102,241,0.15)' : 'var(--card)'
            const border = submitted
              ? isCorrect ? '1.5px solid rgba(74,222,128,0.6)' : isSelected ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid var(--card-border)'
              : isSelected ? '1.5px solid var(--accent)' : '1px solid var(--card-border)'
            return (
              <button key={letter} onClick={() => !submitted && onAnswer(letter)} disabled={submitted}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10, background: bg, border, cursor: submitted ? 'default' : 'pointer', textAlign: 'left' }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{letter}</span>
                <span style={{ fontSize: 13, color: 'var(--fg)' }}>{transcript[i]}</span>
                {submitted && isCorrect && <CheckCircle size={14} style={{ color: 'var(--success)', marginLeft: 'auto', flexShrink: 0 }} />}
                {submitted && isSelected && !isCorrect && <XCircle size={14} style={{ color: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      )}
      {submitted && question.explanation && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

interface Part2Props { question: Question; onAnswer: (sel: string) => void; submitted: boolean; selected: string | null }
function Part2View({ question, onAnswer, submitted, selected }: Part2Props) {
  const c = question.content as Record<string, unknown>
  const { speak, speaking } = useTTS()
  const [phase, setPhase] = useState<'ready' | 'playing' | 'answering'>('ready')
  const opts = question.options as string[]
  const responses = (c.responses as string[]) ?? opts
  const correct = question.answer

  const handlePlay = () => {
    setPhase('playing')
    const script = buildScript(question, 2)
    speak(script, () => setPhase('answering'))
  }

  return (
    <div>
      <div style={{ padding: '16px 20px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--card-border)', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Frage & Antwortoptionen</p>
        <p style={{ fontSize: 14, fontWeight: 500 }}>{(c.question as string) ?? '—'}</p>
      </div>

      {phase === 'ready' && (
        <button onClick={handlePlay}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 10, background: '#D5FD4420', border: '1.5px solid #D5FD4450', color: '#D5FD44', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <Play size={16} /> Frage + Antworten abspielen
        </button>
      )}
      {phase === 'playing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'rgba(213,253,68,0.08)', marginBottom: 16 }}>
          <Volume2 size={15} style={{ color: '#D5FD44' }} />
          <p style={{ fontSize: 13, color: '#D5FD44' }}>Wird abgespielt — Optionen erscheinen danach…</p>
        </div>
      )}

      {(phase === 'answering' || submitted) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['A', 'B', 'C'].map((letter, i) => {
            const isSelected = selected === letter
            const isCorrect = correct === letter
            const bg = submitted
              ? isCorrect ? 'rgba(74,222,128,0.15)' : isSelected ? 'rgba(239,68,68,0.12)' : 'transparent'
              : isSelected ? 'rgba(99,102,241,0.15)' : 'var(--card)'
            const border = submitted
              ? isCorrect ? '1.5px solid rgba(74,222,128,0.6)' : isSelected ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid var(--card-border)'
              : isSelected ? '1.5px solid var(--accent)' : '1px solid var(--card-border)'
            return (
              <button key={letter} onClick={() => !submitted && onAnswer(letter)} disabled={submitted}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10, background: bg, border, cursor: submitted ? 'default' : 'pointer', textAlign: 'left' }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{letter}</span>
                <span style={{ fontSize: 13 }}>{responses[i]}</span>
                {submitted && isCorrect && <CheckCircle size={14} style={{ color: 'var(--success)', marginLeft: 'auto', flexShrink: 0 }} />}
                {submitted && isSelected && !isCorrect && <XCircle size={14} style={{ color: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      )}
      {submitted && question.explanation && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

interface MultiQProps {
  question: Question
  part: 3 | 4
  onAnswers: (answers: Record<number, string>) => void
  submitted: boolean
  selected: Record<number, string>
}
function MultiQuestionView({ question, part, onAnswers, submitted, selected }: MultiQProps) {
  const c = question.content as Record<string, unknown>
  const { speak, speaking } = useTTS()
  const [phase, setPhase] = useState<'prereading' | 'ready' | 'playing' | 'answering'>('prereading')
  const prereadSecs = 30
  const remaining = useTimer(prereadSecs, phase === 'prereading', () => setPhase('ready'))
  const questions = (c.questions as { stem: string; options: string[]; answer: string }[]) ?? []
  const graphic   = c.graphic as { type: string; title: string; headers?: string[]; rows: (string[])[] } | undefined
  const color = part === 3 ? '#fb923c' : '#AE00FF'

  const handlePlay = () => {
    setPhase('playing')
    const script = buildScript(question, part)
    speak(script, () => setPhase('answering'))
  }

  const handleSelect = (qIdx: number, letter: string) => {
    if (submitted) return
    onAnswers({ ...selected, [qIdx]: letter })
  }

  return (
    <div>
      {/* Pre-reading phase */}
      {phase === 'prereading' && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}40`, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, color, fontWeight: 600 }}>Fragen vorab lesen — {remaining} Sek.</p>
          <button onClick={() => setPhase('ready')} style={{ fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer' }}>Überspringen</button>
        </div>
      )}

      {/* Graphic (table/list) if question has one */}
      {graphic && (
        <div style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--card-border)' }}>
          <div style={{ padding: '8px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{graphic.title}</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            {graphic.headers && (
              <thead>
                <tr style={{ background: 'var(--card-border)' }}>
                  {graphic.headers.map(h => <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>{h}</th>)}
                </tr>
              </thead>
            )}
            <tbody>
              {graphic.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '7px 12px' }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Questions preview during prereading */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{qi + 1}. {q.stem}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, oi) => {
                const letter = ['A', 'B', 'C', 'D'][oi]
                const isSelected = selected[qi] === letter
                const isCorrect = q.answer === letter
                const canAnswer = phase === 'answering' || submitted
                const bg = submitted
                  ? isCorrect ? 'rgba(74,222,128,0.15)' : isSelected ? 'rgba(239,68,68,0.12)' : 'transparent'
                  : isSelected ? 'rgba(99,102,241,0.15)' : 'transparent'
                const border = submitted
                  ? isCorrect ? '1.5px solid rgba(74,222,128,0.6)' : isSelected ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid transparent'
                  : isSelected ? '1.5px solid var(--accent)' : '1px solid transparent'
                return (
                  <button key={letter} onClick={() => canAnswer && handleSelect(qi, letter)}
                    disabled={!canAnswer || submitted}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: bg, border, cursor: canAnswer && !submitted ? 'pointer' : 'default', textAlign: 'left', opacity: canAnswer ? 1 : 0.5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{letter}</span>
                    <span style={{ fontSize: 12 }}>{opt}</span>
                    {submitted && isCorrect && <CheckCircle size={13} style={{ color: 'var(--success)', marginLeft: 'auto' }} />}
                    {submitted && isSelected && !isCorrect && <XCircle size={13} style={{ color: '#ef4444', marginLeft: 'auto' }} />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Play button */}
      {(phase === 'ready') && (
        <button onClick={handlePlay}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 10, background: `${color}20`, border: `1.5px solid ${color}50`, color, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Play size={16} /> {part === 3 ? 'Gespräch abspielen' : 'Ansage abspielen'}
        </button>
      )}
      {phase === 'playing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: `${color}10` }}>
          <Volume2 size={15} style={{ color }} />
          <p style={{ fontSize: 13, color }}>Wird abgespielt…</p>
        </div>
      )}
      {submitted && question.explanation && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

// ── Main Shell ───────────────────────────────────────────────────────────────

interface ListeningShellProps { part: ListeningPart }

export default function ListeningShell({ part }: ListeningShellProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [multiSelected, setMultiSelected] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const startTime = useRef(Date.now())

  const PART_META: Record<number, { label: string; color: string; desc: string }> = {
    1: { label: 'Part 1 – Fotos beschreiben', color: '#04FF88', desc: 'Wähle die Aussage, die das Foto am besten beschreibt.' },
    2: { label: 'Part 2 – Frage & Antwort', color: '#D5FD44', desc: 'Wähle die passende Antwort auf die gehörte Frage.' },
    3: { label: 'Part 3 – Gespräche', color: '#fb923c', desc: 'Lies die Fragen vorab, höre dann das Gespräch.' },
    4: { label: 'Part 4 – Monologe', color: '#AE00FF', desc: 'Lies die Fragen vorab, höre dann die Ansage.' },
  }
  const meta = PART_META[part]

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/questions?part=${part}&limit=6`)
      const data = await res.json()
      setQuestions(data.questions ?? [])
      const sr = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PART_PRACTICE', parts: [part], totalQuestions: data.questions?.length ?? 0 }),
      })
      const sd = await sr.json()
      setSessionId(sd.id)
      setLoading(false)
      startTime.current = Date.now()
    }
    load()
  }, [part])

  useEffect(() => {
    setSelected(null)
    setMultiSelected({})
    setSubmitted(false)
    startTime.current = Date.now()
  }, [currentIndex])

  const isMultiQ = part === 3 || part === 4
  const q = questions[currentIndex]

  const getCorrectAnswer = (q: Question) => q.answer

  const handleSubmit = () => {
    if (!q) return
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000)

    if (!isMultiQ) {
      if (!selected) return
      const correct = selected === getCorrectAnswer(q)
      setAnswers(prev => [...prev, { questionId: q.id, selected, correct, timeSpentSec: timeSpent }])
    } else {
      const subQs = (q.content as Record<string, unknown>).questions as { answer: string }[] ?? []
      subQs.forEach((sq, i) => {
        const sel = multiSelected[i] ?? ''
        const correct = sel === sq.answer
        setAnswers(prev => [...prev, { questionId: q.id + '_' + i, selected: sel, correct, timeSpentSec: timeSpent }])
      })
    }
    setSubmitted(true)
  }

  const handleNext = async () => {
    if (currentIndex + 1 >= questions.length) {
      // Save session
      if (sessionId) {
        const score = answers.filter(a => a.correct).length
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, maxScore: answers.length, durationSec: Math.round((Date.now() - startTime.current) / 1000), answers }),
        })
      }
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  // ── Finished screen ────────────────────────────────────────────────────────
  if (finished) {
    const correct = answers.filter(a => a.correct).length
    const total = answers.length
    const pct = total > 0 ? Math.round(correct / total * 100) : 0
    const pctColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : '#ef4444'
    const NEXT_PARTS: Record<ListeningPart, { href: string; label: string }> = {
      1: { href: '/practice/part2', label: 'Part 2 – Frage & Antwort' },
      2: { href: '/practice/part3', label: 'Part 3 – Gespräche' },
      3: { href: '/practice/part4', label: 'Part 4 – Monologe' },
      4: { href: '/test-training',  label: 'Test Training Übersicht' },
    }
    const next = NEXT_PARTS[part]
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="text-2xl font-bold" style={{ marginBottom: 4 }}>{meta.label}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Übung abgeschlossen</p>
        </div>
        <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 64, fontWeight: 800, color: pctColor, lineHeight: 1, marginBottom: 8 }}>{pct}%</p>
          <p className="text-lg font-semibold" style={{ marginBottom: 4 }}>{correct} von {total} richtig</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {pct >= 80 ? '🏆 Ausgezeichnet — prüfungsreifes Niveau!' : pct >= 60 ? '💪 Gut! Weiter üben für volle Sicherheit.' : '📚 Weiter üben — dieser Part braucht mehr Aufmerksamkeit.'}
          </p>
        </div>
        {answers.some(a => !a.correct) && (
          <details style={{ marginBottom: 16 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--muted)', padding: '10px 16px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--card-border)', listStyle: 'none' }}>
              ▶ Falsche Antworten ({answers.filter(a => !a.correct).length})
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {answers.filter(a => !a.correct).map((a, i) => {
                const qIdx = answers.indexOf(a)
                const q = questions[Math.floor(qIdx / (part === 3 || part === 4 ? 3 : 1))]
                return (
                  <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>Antwort: <strong style={{ color: '#ef4444' }}>{a.selected || '—'}</strong> → Richtig: <strong style={{ color: 'var(--success)' }}>{q?.answer ?? '?'}</strong></p>
                      {q?.explanation && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{q.explanation}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { setFinished(false); setCurrentIndex(0); setAnswers([]); setSubmitted(false); setSelected(null); setMultiSelected({}) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: meta.color + '20', border: `1.5px solid ${meta.color}50`, color: meta.color, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <RotateCcw size={14} /> Nochmal
          </button>
          <button onClick={() => router.push(next.href)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#0d1b2a', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <TrendingUp size={14} /> {next.label}
          </button>
          <button onClick={() => router.push('/test-training')} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
            Übersicht
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ padding: '16px 0', marginBottom: 20 }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 4 }}>{meta.label}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{meta.desc}</p>
      </div>
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Fragen werden geladen…</div>
    </div>
  )

  if (!q) return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Keine Fragen verfügbar.</p>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Stelle sicher dass <code>npm run db:seed</code> ausgeführt wurde.</p>
      </div>
    </div>
  )

  const canSubmit = isMultiQ
    ? Object.keys(multiSelected).length > 0
    : selected !== null

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 4 }}>{meta.label}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{meta.desc}</p>
      </div>

      <ProgressBar current={currentIndex} total={questions.length} color={meta.color} />

      {/* Question counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
          Frage {currentIndex + 1} / {questions.length}
        </p>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: meta.color + '15', color: meta.color, fontWeight: 700 }}>
          LISTENING
        </span>
      </div>

      {/* Question view */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        {part === 1 && (
          <Part1View question={q} onAnswer={setSelected} submitted={submitted} selected={selected} />
        )}
        {part === 2 && (
          <Part2View question={q} onAnswer={setSelected} submitted={submitted} selected={selected} />
        )}
        {(part === 3 || part === 4) && (
          <MultiQuestionView
            question={q} part={part}
            onAnswers={setMultiSelected} submitted={submitted} selected={multiSelected}
          />
        )}
      </div>

      {/* Actions */}
      {!submitted ? (
        <button onClick={handleSubmit} disabled={!canSubmit}
          style={{ width: '100%', padding: '12px', borderRadius: 10, background: canSubmit ? meta.color : 'var(--card-border)', color: canSubmit ? '#000' : 'var(--muted)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, transition: 'all 0.15s' }}>
          Antwort prüfen
        </button>
      ) : (
        <button onClick={handleNext}
          style={{ width: '100%', padding: '12px', borderRadius: 10, background: meta.color, color: '#000', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {currentIndex + 1 >= questions.length ? 'Auswertung anzeigen' : 'Nächste Frage'}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
