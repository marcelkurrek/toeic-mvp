'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, RotateCcw, Clock, ChevronRight, CheckCircle } from 'lucide-react'
import type { Question } from '@/types'

type SpeakingMode = 'read-aloud' | 'describe' | 'respond'

interface SpeakingShellProps {
  mode: SpeakingMode
}

type Phase = 'idle' | 'prep' | 'recording' | 'feedback' | 'done'

interface FeedbackResult {
  complete: boolean
  completenessPercent: number
  feedback: string
  missingPortion?: string | null
}

// ── Timer hook ────────────────────────────────────────────────────────────────
function useTimer(seconds: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running) { if (ref.current) clearInterval(ref.current); return }
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current!); onEnd(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, onEnd])

  return remaining
}

type AnyRecognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: SpeechRecognitionEvent) => void) | null; start(): void; stop(): void }

// ── Web Speech Recognition ────────────────────────────────────────────────────
function useRecognition() {
  const recognitionRef = useRef<AnyRecognition | null>(null)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: (new () => AnyRecognition) | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let final = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
      }
      setTranscript(final.trim())
    }
    recognitionRef.current = rec
  }, [])

  const start = useCallback(() => {
    setTranscript('')
    try { recognitionRef.current?.start() } catch { /* already started */ }
  }, [])

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* already stopped */ }
  }, [])

  return { transcript, supported, start, stop, setTranscript }
}

// ── Read Aloud Task ───────────────────────────────────────────────────────────
function ReadAloudTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as { text: string; prepSeconds: number; speakSeconds: number }
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { transcript, supported, start, stop } = useRecognition()
  const startTimeRef = useRef<number>(0)

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stop()
    setPhase('feedback')
    const duration = (Date.now() - startTimeRef.current) / 1000
    setLoading(true)
    fetch('/api/speech-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        expectedText: content.text,
        questionType: 'READ_ALOUD',
        durationSeconds: duration,
      }),
    })
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [stop, transcript, content.text])

  const prepRemaining = useTimer(content.prepSeconds, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(content.speakSeconds, phase === 'recording', handleRecordEnd)

  useEffect(() => {
    if (phase === 'recording') { start(); startTimeRef.current = Date.now() }
  }, [phase, start])

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Aufgabe: Laut vorlesen</p>
      <div className="rounded-lg p-4 mb-5 text-sm leading-relaxed"
        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        {content.text}
      </div>

      {/* Phases */}
      {phase === 'idle' && (
        <button onClick={() => setPhase('prep')} className="btn-primary">Vorbereitung starten</button>
      )}
      {phase === 'prep' && (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div>
          <p style={{ color: 'var(--muted)' }}>Bereite dich vor… dann wird aufgenommen.</p>
        </div>
      )}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} />
            <span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span>
            <span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span>
          </div>
          {!supported && (
            <p className="text-sm p-3 rounded-lg" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>
              Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.
            </p>
          )}
          <button
            onClick={handleRecordEnd}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: 'var(--error)', color: '#fff' }}>
            <MicOff size={14} /> Aufnahme stoppen
          </button>
        </div>
      )}
      {phase === 'feedback' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
          ) : feedback ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: feedback.complete ? 'var(--green-subtle)' : 'var(--orange-subtle)', color: feedback.complete ? 'var(--success)' : 'var(--warning)' }}>
                  {feedback.completenessPercent}%
                </div>
                <div>
                  <p className="font-semibold text-sm">{feedback.complete ? 'Gut gemacht!' : 'Weiter üben'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Vollständigkeit</p>
                </div>
              </div>
              <div className="rounded-lg p-4 mb-4 text-sm"
                style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
                {feedback.feedback}
              </div>
              {transcript && (
                <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'var(--surface)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Dein Transcript:</p>
                  <p className="italic">{transcript}</p>
                </div>
              )}
              <button onClick={onNext} className="btn-primary flex items-center gap-2">
                {isLast ? 'Fertig' : 'Weiter'} <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── Describe Picture Task ─────────────────────────────────────────────────────
function DescribeTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as { imageUrl: string; prompt: string; prepSeconds: number; speakSeconds: number; hints: string[] }
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { transcript, supported, start, stop } = useRecognition()
  const startTimeRef = useRef<number>(0)

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stop()
    setPhase('feedback')
    const duration = (Date.now() - startTimeRef.current) / 1000
    setLoading(true)
    fetch('/api/speech-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, questionType: 'DESCRIBE_PICTURE', durationSeconds: duration }),
    })
      .then(r => r.json())
      .then(data => { setFeedback(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [stop, transcript])

  const prepRemaining = useTimer(content.prepSeconds, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(content.speakSeconds, phase === 'recording', handleRecordEnd)

  useEffect(() => {
    if (phase === 'recording') { start(); startTimeRef.current = Date.now() }
  }, [phase, start])

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Aufgabe: Bild beschreiben</p>
      <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 280 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.imageUrl} alt="Describe this picture" style={{ width: '100%', objectFit: 'cover', maxHeight: 280 }} />
      </div>
      <p className="text-sm font-medium mb-3">{content.prompt}</p>
      {content.hints && (
        <div className="flex gap-2 flex-wrap mb-4">
          {content.hints.map(h => (
            <span key={h} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>{h}</span>
          ))}
        </div>
      )}

      {phase === 'idle' && (
        <button onClick={() => setPhase('prep')} className="btn-primary">Vorbereitung starten</button>
      )}
      {phase === 'prep' && (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div>
          <p style={{ color: 'var(--muted)' }}>Betrachte das Bild…</p>
        </div>
      )}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} />
            <span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span>
            <span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span>
          </div>
          {!supported && (
            <p className="text-sm p-3 rounded-lg mb-2" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>
              Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.
            </p>
          )}
          <button onClick={handleRecordEnd} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: 'var(--error)', color: '#fff' }}>
            <MicOff size={14} /> Aufnahme stoppen
          </button>
        </div>
      )}
      {phase === 'feedback' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
          ) : feedback ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: feedback.complete ? 'var(--green-subtle)' : 'var(--orange-subtle)', color: feedback.complete ? 'var(--success)' : 'var(--warning)' }}>
                  {feedback.completenessPercent}%
                </div>
                <div>
                  <p className="font-semibold text-sm">{feedback.complete ? 'Gut gemacht!' : 'Weiter üben'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Vollständigkeit</p>
                </div>
              </div>
              <div className="rounded-lg p-4 mb-3 text-sm"
                style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
                {feedback.feedback}
              </div>
              {question.explanation && (
                <div className="rounded-lg p-3 mb-3 text-sm" style={{ background: 'var(--surface)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--accent)' }}>TOEIC-Tipp:</p>
                  <p>{question.explanation}</p>
                </div>
              )}
              <button onClick={onNext} className="btn-primary flex items-center gap-2">
                {isLast ? 'Fertig' : 'Weiter'} <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── Respond Free Task ─────────────────────────────────────────────────────────
function RespondTask({ question, onNext, isLast }: {
  question: Question
  onNext: () => void
  isLast: boolean
}) {
  const content = question.content as {
    scenario: string
    questions: { id: string; text: string; prepSeconds: number; speakSeconds: number }[]
  }
  const [subIndex, setSubIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedbacks, setFeedbacks] = useState<FeedbackResult[]>([])
  const [loading, setLoading] = useState(false)
  const { transcript, supported, start, stop } = useRecognition()
  const startTimeRef = useRef<number>(0)

  const subQ = content.questions[subIndex]

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stop()
    setPhase('feedback')
    const duration = (Date.now() - startTimeRef.current) / 1000
    setLoading(true)
    fetch('/api/speech-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, questionType: 'RESPOND_FREE', durationSeconds: duration }),
    })
      .then(r => r.json())
      .then(data => { setFeedbacks(prev => [...prev, data]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [stop, transcript])

  const prepRemaining = useTimer(subQ?.prepSeconds ?? 3, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(subQ?.speakSeconds ?? 15, phase === 'recording', handleRecordEnd)

  useEffect(() => {
    if (phase === 'recording') { start(); startTimeRef.current = Date.now() }
  }, [phase, start])

  function handleNextSub() {
    if (subIndex + 1 >= content.questions.length) {
      onNext()
    } else {
      setSubIndex(i => i + 1)
      setPhase('idle')
    }
  }

  if (!subQ) return null

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Szenario:</p>
        <p>{content.scenario}</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--card-border)', color: 'var(--muted)' }}>
          Frage {subIndex + 1} / {content.questions.length}
        </span>
      </div>

      <p className="text-base font-semibold mb-4">{subQ.text}</p>

      {phase === 'idle' && (
        <button onClick={() => setPhase('prep')} className="btn-primary">Antwort vorbereiten</button>
      )}
      {phase === 'prep' && (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div>
          <p style={{ color: 'var(--muted)' }}>Bereite deine Antwort vor…</p>
        </div>
      )}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} />
            <span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span>
            <span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span>
          </div>
          {!supported && (
            <p className="text-sm p-3 rounded-lg mb-2" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>
              Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.
            </p>
          )}
          <button onClick={handleRecordEnd} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: 'var(--error)', color: '#fff' }}>
            <MicOff size={14} /> Stoppen
          </button>
        </div>
      )}
      {phase === 'feedback' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Feedback wird erstellt…</p>
          ) : feedbacks[subIndex] ? (
            <div>
              <div className="rounded-lg p-4 mb-3 text-sm"
                style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
                {feedbacks[subIndex].feedback}
              </div>
              <button onClick={handleNextSub} className="btn-primary flex items-center gap-2">
                {subIndex + 1 >= content.questions.length ? (isLast ? 'Fertig' : 'Weiter') : `Frage ${subIndex + 2}`} <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── Main SpeakingShell ────────────────────────────────────────────────────────
export default function SpeakingShell({ mode }: SpeakingShellProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)

  const modeConfig = {
    'read-aloud': { label: 'Speaking – Vorlesen', type: 'READ_ALOUD', part: 1, section: 'SPEAKING', back: '/speaking' },
    'describe':   { label: 'Speaking – Bild beschreiben', type: 'DESCRIBE_PICTURE', part: 2, section: 'SPEAKING', back: '/speaking' },
    'respond':    { label: 'Speaking – Fragen beantworten', type: 'RESPOND_FREE', part: 3, section: 'SPEAKING', back: '/speaking' },
  }

  const config = modeConfig[mode]

  const load = useCallback(async () => {
    setLoading(true)
    setIndex(0)
    setFinished(false)
    const res = await fetch(`/api/questions?section=${config.section}&part=${config.part}`)
    const data = await res.json()
    setQuestions(data.questions ?? [])
    setLoading(false)
  }, [config.section, config.part])

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
          <p style={{ color: 'var(--muted)' }}>Regelmäßiges Üben verbessert deine Aussprache und Flüssigkeit.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={load} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> Nochmals üben
          </button>
          <button onClick={() => router.push(config.back)}
            className="text-sm font-medium rounded-lg border"
            style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>
            Zurück zu Speaking
          </button>
        </div>
      </div>
    )
  }

  const question = questions[index] as Question

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="text-2xl font-bold mb-1">{config.label}</h1>
          <p className="text-sm flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <Mic size={13} /> Mikrofon + KI-Feedback
          </p>
        </div>
        <div className="text-sm font-medium rounded-full"
          style={{ padding: '4px 14px', background: 'var(--card-border)', whiteSpace: 'nowrap' }}>
          {index + 1} / {questions.length}
        </div>
      </div>

      <div className="rounded-full overflow-hidden" style={{ height: 6, marginBottom: 24, background: 'var(--card-border)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {mode === 'read-aloud' && (
        <ReadAloudTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
      {mode === 'describe' && (
        <DescribeTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
      {mode === 'respond' && (
        <RespondTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />
      )}
    </div>
  )
}
