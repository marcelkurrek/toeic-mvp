'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, RotateCcw, ChevronRight, CheckCircle, Play, Pause, Loader2 } from 'lucide-react'
import type { Question } from '@/types'

type SpeakingMode = 'read-aloud' | 'describe' | 'respond'
interface SpeakingShellProps { mode: SpeakingMode }
type Phase = 'idle' | 'prep' | 'recording' | 'done'
interface FeedbackResult { complete: boolean; completenessPercent: number; feedback: string; missingPortion?: string | null }

function useTimer(seconds: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => { setRemaining(seconds) }, [seconds])
  useEffect(() => {
    if (!running) { if (ref.current) clearInterval(ref.current); return }
    ref.current = setInterval(() => {
      setRemaining(prev => { if (prev <= 1) { clearInterval(ref.current!); onEnd(); return 0 } return prev - 1 })
    }, 1000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running, onEnd])
  return remaining
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: any) => void) | null; start(): void; stop(): void }

function useRecognition() {
  const recognitionRef = useRef<AnyRecognition | null>(null)
  const [transcript, setTranscript] = useState('')
  const transcriptRef = useRef('')
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: (new () => AnyRecognition) | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const rec = new SR()
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true
    rec.onresult = (e) => {
      let final = ''
      for (let i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ' }
      const t = final.trim()
      setTranscript(t)
      transcriptRef.current = t
    }
    recognitionRef.current = rec
  }, [])
  const start = useCallback(() => { setTranscript(''); transcriptRef.current = ''; try { recognitionRef.current?.start() } catch { /* already started */ } }, [])
  const stop = useCallback(() => { try { recognitionRef.current?.stop() } catch { /* already stopped */ } }, [])
  return { transcript, transcriptRef, supported, start, stop }
}

function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setSupported(false)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])
  const startRecording = useCallback(async () => {
    setAudioUrl(null); chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) })
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
    } catch { setSupported(false) }
  }, [])
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
  }, [])
  const clearAudio = useCallback(() => {
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
  }, [])
  return { audioUrl, supported, startRecording, stopRecording, clearAudio }
}

function AudioPlayback({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPlaying(false)
    audio.onerror = () => setPlaying(false)
    return () => { audio.pause(); audio.src = '' }
  }, [url])
  function toggle() {
    const audio = audioRef.current; if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) } else { audio.play(); setPlaying(true) }
  }
  return (
    <button onClick={toggle} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
      {playing ? <Pause size={14} /> : <Play size={14} />}
      {playing ? 'Pausieren' : 'Aufnahme abspielen'}
    </button>
  )
}

function FeedbackCard({ feedback, transcript, showTranscript }: {
  feedback: FeedbackResult; transcript?: string; showTranscript?: boolean
}) {
  const pct = feedback.completenessPercent
  const pctColor = pct >= 85 ? 'var(--success)' : pct >= 60 ? '#f59e0b' : 'var(--error)'
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: feedback.complete ? 'var(--green-subtle)' : 'rgba(245,158,11,0.12)', color: pctColor }}>
          {pct}%
        </div>
        <p className="font-semibold text-sm">{feedback.complete ? 'Gut gemacht!' : 'Weiter üben'}</p>
      </div>
      <div className="rounded-lg p-4 mb-3 text-sm leading-relaxed" style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)' }}>
        {feedback.feedback}
      </div>
      {showTranscript && transcript && (
        <div className="rounded-lg p-3 text-sm mb-3" style={{ background: 'var(--surface)' }}>
          <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Erkannter Text:</p>
          <p className="italic">{transcript}</p>
        </div>
      )}
    </div>
  )
}

function DonePanel({ audioUrl, feedback, loadingFeedback, transcript, showTranscript, onReRecord, onNext, isLast, nextLabel }: {
  audioUrl: string | null
  feedback: FeedbackResult | null
  loadingFeedback: boolean
  transcript?: string
  showTranscript?: boolean
  onReRecord: () => void
  onNext: () => void
  isLast: boolean
  nextLabel?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {audioUrl && <AudioPlayback url={audioUrl} />}
      {loadingFeedback
        ? <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}><Loader2 size={14} className="animate-spin" /> Feedback wird berechnet…</div>
        : feedback && <FeedbackCard feedback={feedback} transcript={transcript} showTranscript={showTranscript} />
      }
      <div className="flex gap-3 flex-wrap">
        <button onClick={onReRecord} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border"
          style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}>
          <RotateCcw size={14} /> Nochmal aufnehmen
        </button>
        {!loadingFeedback && (
          <button onClick={onNext} className="btn-primary flex items-center gap-2">
            {nextLabel ?? (isLast ? 'Fertig' : 'Weiter')} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function ReadAloudTask({ question, onNext, isLast }: { question: Question; onNext: () => void; isLast: boolean }) {
  const content = question.content as { text: string; prepSeconds: number; speakSeconds: number }
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const { transcript, transcriptRef, supported: srSupported, start: startSR, stop: stopSR } = useRecognition()
  const { audioUrl, startRecording, stopRecording, clearAudio } = useAudioRecorder()
  const startTimeRef = useRef<number>(0)
  const durationRef = useRef<number>(0)

  const fetchFeedback = useCallback((t: string, dur: number) => {
    setLoadingFeedback(true)
    fetch('/api/speech-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: t, expectedText: content.text, questionType: 'READ_ALOUD', durationSeconds: dur }) })
      .then(r => r.json()).then(data => { setFeedback(data as FeedbackResult); setLoadingFeedback(false) })
      .catch(() => setLoadingFeedback(false))
  }, [content.text])

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stopSR(); stopRecording()
    const dur = (Date.now() - startTimeRef.current) / 1000
    durationRef.current = dur
    setPhase('done')
    setTimeout(() => fetchFeedback(transcriptRef.current, dur), 300)
  }, [stopSR, stopRecording, fetchFeedback, transcriptRef])

  const handleReRecord = useCallback(() => {
    clearAudio(); setFeedback(null); setPhase('recording')
    startSR(); startRecording(); startTimeRef.current = Date.now()
  }, [clearAudio, startSR, startRecording])

  const prepRemaining = useTimer(content.prepSeconds, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(content.speakSeconds, phase === 'recording', handleRecordEnd)
  useEffect(() => { if (phase === 'recording') { startSR(); startRecording(); startTimeRef.current = Date.now() } }, [phase, startSR, startRecording])

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Aufgabe: Laut vorlesen</p>
      <div className="rounded-lg p-4 mb-5 text-sm leading-relaxed" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>{content.text}</div>
      {phase === 'idle' && <button onClick={() => setPhase('prep')} className="btn-primary">Vorbereitung starten</button>}
      {phase === 'prep' && <div className="flex items-center gap-4"><div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div><p style={{ color: 'var(--muted)' }}>Bereite dich vor… dann wird aufgenommen.</p></div>}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} /><span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span><span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span></div>
          {!srSupported && <p className="text-sm p-3 rounded-lg" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.</p>}
          <button onClick={handleRecordEnd} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ background: 'var(--error)', color: '#fff' }}><MicOff size={14} /> Aufnahme stoppen</button>
        </div>
      )}
      {phase === 'done' && (
        <DonePanel audioUrl={audioUrl} feedback={feedback} loadingFeedback={loadingFeedback} transcript={transcript} showTranscript onReRecord={handleReRecord} onNext={onNext} isLast={isLast} />
      )}
    </div>
  )
}

function DescribeTask({ question, onNext, isLast }: { question: Question; onNext: () => void; isLast: boolean }) {
  const content = question.content as { imageUrl: string; prompt: string; prepSeconds: number; speakSeconds: number; hints: string[] }
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const { transcript, transcriptRef, supported: srSupported, start: startSR, stop: stopSR } = useRecognition()
  const { audioUrl, startRecording, stopRecording, clearAudio } = useAudioRecorder()
  const startTimeRef = useRef<number>(0)
  const durationRef = useRef<number>(0)

  const fetchFeedback = useCallback((t: string, dur: number) => {
    setLoadingFeedback(true)
    fetch('/api/speech-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: t, questionType: 'DESCRIBE_PICTURE', durationSeconds: dur }) })
      .then(r => r.json()).then(data => { setFeedback(data as FeedbackResult); setLoadingFeedback(false) })
      .catch(() => setLoadingFeedback(false))
  }, [])

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stopSR(); stopRecording()
    const dur = (Date.now() - startTimeRef.current) / 1000
    durationRef.current = dur
    setPhase('done')
    setTimeout(() => fetchFeedback(transcriptRef.current, dur), 300)
  }, [stopSR, stopRecording, fetchFeedback, transcriptRef])

  const handleReRecord = useCallback(() => {
    clearAudio(); setFeedback(null); setPhase('recording')
    startSR(); startRecording(); startTimeRef.current = Date.now()
  }, [clearAudio, startSR, startRecording])

  const prepRemaining = useTimer(content.prepSeconds, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(content.speakSeconds, phase === 'recording', handleRecordEnd)
  useEffect(() => { if (phase === 'recording') { startSR(); startRecording(); startTimeRef.current = Date.now() } }, [phase, startSR, startRecording])

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Aufgabe: Bild beschreiben</p>
      <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 280 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.imageUrl} alt="Describe this picture" style={{ width: '100%', objectFit: 'cover', maxHeight: 280 }} />
      </div>
      <p className="text-sm font-medium mb-3">{content.prompt}</p>
      {content.hints && content.hints.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center mb-4">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Tipp:</span>
          {content.hints.map(h => <span key={h} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>{h}</span>)}
        </div>
      )}
      {phase === 'idle' && <button onClick={() => setPhase('prep')} className="btn-primary">Vorbereitung starten</button>}
      {phase === 'prep' && <div className="flex items-center gap-4"><div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div><p style={{ color: 'var(--muted)' }}>Betrachte das Bild…</p></div>}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} /><span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span><span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span></div>
          {!srSupported && <p className="text-sm p-3 rounded-lg mb-2" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.</p>}
          <button onClick={handleRecordEnd} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ background: 'var(--error)', color: '#fff' }}><MicOff size={14} /> Aufnahme stoppen</button>
        </div>
      )}
      {phase === 'done' && (
        <DonePanel audioUrl={audioUrl} feedback={feedback} loadingFeedback={loadingFeedback} onReRecord={handleReRecord} onNext={onNext} isLast={isLast} />
      )}
    </div>
  )
}

function RespondTask({ question, onNext, isLast }: { question: Question; onNext: () => void; isLast: boolean }) {
  const content = question.content as { scenario: string; questions: { id: string; text: string; prepSeconds: number; speakSeconds: number }[] }
  const [subIndex, setSubIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [feedbacks, setFeedbacks] = useState<FeedbackResult[]>([])
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const { transcript, transcriptRef, supported: srSupported, start: startSR, stop: stopSR } = useRecognition()
  const { audioUrl, startRecording, stopRecording, clearAudio } = useAudioRecorder()
  const startTimeRef = useRef<number>(0)
  const durationRef = useRef<number>(0)
  const subQ = content.questions[subIndex]
  const subIndexRef = useRef(subIndex)
  useEffect(() => { subIndexRef.current = subIndex }, [subIndex])

  const fetchFeedback = useCallback((t: string, dur: number, idx: number) => {
    setLoadingFeedback(true)
    fetch('/api/speech-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: t, questionType: 'RESPOND_FREE', durationSeconds: dur }) })
      .then(r => r.json()).then(data => {
        setFeedbacks(prev => { const next = [...prev]; next[idx] = data as FeedbackResult; return next })
        setLoadingFeedback(false)
      })
      .catch(() => setLoadingFeedback(false))
  }, [])

  const handlePrepEnd = useCallback(() => setPhase('recording'), [])
  const handleRecordEnd = useCallback(() => {
    stopSR(); stopRecording()
    const dur = (Date.now() - startTimeRef.current) / 1000
    durationRef.current = dur
    setPhase('done')
    const idx = subIndexRef.current
    setTimeout(() => fetchFeedback(transcriptRef.current, dur, idx), 300)
  }, [stopSR, stopRecording, fetchFeedback, transcriptRef])

  const handleReRecord = useCallback(() => {
    clearAudio(); setPhase('recording')
    startSR(); startRecording(); startTimeRef.current = Date.now()
  }, [clearAudio, startSR, startRecording])

  const prepRemaining = useTimer(subQ?.prepSeconds ?? 3, phase === 'prep', handlePrepEnd)
  const recRemaining = useTimer(subQ?.speakSeconds ?? 15, phase === 'recording', handleRecordEnd)
  useEffect(() => { if (phase === 'recording') { startSR(); startRecording(); startTimeRef.current = Date.now() } }, [phase, startSR, startRecording])

  function handleNextSub() {
    clearAudio()
    if (subIndex + 1 >= content.questions.length) { onNext() }
    else { setSubIndex(i => i + 1); setPhase('idle') }
  }

  if (!subQ) return null

  const nextSubLabel = subIndex + 1 >= content.questions.length ? (isLast ? 'Fertig' : 'Weiter') : `Frage ${subIndex + 2}`

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Szenario:</p><p>{content.scenario}</p></div>
      <div className="flex items-center gap-2 mb-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--card-border)', color: 'var(--muted)' }}>Frage {subIndex + 1} / {content.questions.length}</span></div>
      <p className="text-base font-semibold mb-4">{subQ.text}</p>
      {phase === 'idle' && <button onClick={() => setPhase('prep')} className="btn-primary">Antwort vorbereiten</button>}
      {phase === 'prep' && <div className="flex items-center gap-4"><div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{prepRemaining}s</div><p style={{ color: 'var(--muted)' }}>Bereite deine Antwort vor…</p></div>}
      {phase === 'recording' && (
        <div>
          <div className="flex items-center gap-3 mb-3"><div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--error)' }} /><span className="font-medium" style={{ color: 'var(--error)' }}>Aufnahme läuft</span><span className="ml-auto font-bold text-lg" style={{ color: 'var(--error)' }}>{recRemaining}s</span></div>
          {!srSupported && <p className="text-sm p-3 rounded-lg mb-2" style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>Spracherkennung nicht unterstützt. Bitte Chrome/Edge verwenden.</p>}
          <button onClick={handleRecordEnd} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ background: 'var(--error)', color: '#fff' }}><MicOff size={14} /> Stoppen</button>
        </div>
      )}
      {phase === 'done' && (
        <DonePanel audioUrl={audioUrl} feedback={feedbacks[subIndex] ?? null} loadingFeedback={loadingFeedback} onReRecord={handleReRecord} onNext={handleNextSub} isLast={isLast} nextLabel={nextSubLabel} />
      )}
    </div>
  )
}

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
    setLoading(true); setIndex(0); setFinished(false)
    const res = await fetch(`/api/questions?section=${config.section}&part=${config.part}`)
    const data = await res.json() as { questions: Question[] }
    setQuestions(data.questions ?? []); setLoading(false)
  }, [config.section, config.part])
  useEffect(() => { load() }, [load])
  function handleNext() { if (index + 1 >= questions.length) { setFinished(true) } else { setIndex(i => i + 1) } }
  if (loading) return (<div style={{ maxWidth: 768, margin: '0 auto' }}><h1 className="text-2xl font-bold mb-4">{config.label}</h1><div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Aufgaben werden geladen…</div></div>)
  if (questions.length === 0) return (<div style={{ maxWidth: 768, margin: '0 auto' }}><h1 className="text-2xl font-bold mb-4">{config.label}</h1><div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Keine Aufgaben verfügbar.</div></div>)
  if (finished) return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <h1 className="text-2xl font-bold mb-6">{config.label} — Fertig!</h1>
      <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
        <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
        <p className="text-lg font-semibold mb-1">Alle Aufgaben abgeschlossen!</p>
        <p style={{ color: 'var(--muted)' }}>Regelmäßiges Üben verbessert deine Aussprache und Flüssigkeit.</p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={load} className="btn-primary flex items-center gap-2"><RotateCcw size={16} /> Nochmals üben</button>
        <button onClick={() => router.push(config.back)} className="text-sm font-medium rounded-lg border" style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>Zurück zu Speaking</button>
      </div>
    </div>
  )
  const question = questions[index] as Question
  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="text-2xl font-bold mb-1">{config.label}</h1><p className="text-sm flex items-center gap-1" style={{ color: 'var(--muted)' }}><Mic size={13} /> Mikrofon + KI-Feedback</p></div>
        <div className="text-sm font-medium rounded-full" style={{ padding: '4px 14px', background: 'var(--card-border)', whiteSpace: 'nowrap' }}>{index + 1} / {questions.length}</div>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, marginBottom: 24, background: 'var(--card-border)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(index / questions.length) * 100}%`, background: 'var(--accent)' }} />
      </div>
      {mode === 'read-aloud' && <ReadAloudTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />}
      {mode === 'describe' && <DescribeTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />}
      {mode === 'respond' && <RespondTask key={question.id} question={question} onNext={handleNext} isLast={index === questions.length - 1} />}
    </div>
  )
}