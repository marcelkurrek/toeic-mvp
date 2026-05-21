'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Volume2, ChevronRight, CheckCircle, XCircle, RotateCcw, Eye, EyeOff, TrendingUp, ChevronDown, ChevronUp, Lightbulb, X, AlertTriangle } from 'lucide-react'

function ExitDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '28px 32px', maxWidth: 360, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <p style={{ fontWeight: 700, fontSize: 15 }}>Session abbrechen?</p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
          Dein Fortschritt in dieser Session wird <strong style={{ color: 'var(--fg)' }}>nicht gespeichert</strong>. Beantwortete Fragen gehen verloren.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--fg)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Weitermachen
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}

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
    utt.rate = 0.8
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

const PART_STRATEGY: Record<number, { title: string; tips: string[] }> = {
  1: {
    title: 'Part 1 Strategie — Fotos beschreiben',
    tips: [
      'Analysiere die Personen: Wie viele? Männer/Frauen? Welcher Beruf? Was tun sie gerade?',
      'Analysiere Objekte und Ort: Was liegt/steht wo? Welcher Raum/Außenbereich?',
      'Richtige Antwort beschreibt genau was JETZT zu sehen ist — keine Vermutungen.',
      'Eliminiere Aussagen mit Details die NICHT auf dem Foto sind (sound-alike Fallen!).',
      'Zeitformen: "is being" (aktiv, gerade jetzt) vs. "has been" (abgeschlossen) sind häufige Fallen.',
    ],
  },
  2: {
    title: 'Part 2 Strategie — Frage & Antwort',
    tips: [
      'Identifiziere sofort das Fragewort: Who/What/When/Where/Why/How.',
      'Richtige Antwort PASST zur Frage — oft indirekt (kein "Yes/No" bei W-Fragen).',
      'Achtung: Ähnlich klingende Wörter (sound-alikes), Synonyme und Homonyme sind Fallen.',
      'Erkenne Vorschläge (Why don\'t we…), Angebote (Would you like…) und Bitten (Could you…).',
      'Bei "or"-Fragen: Antwort wählt eine Option oder sagt "neither/both".',
    ],
  },
  3: {
    title: 'Part 3 Strategie — Gespräche',
    tips: [
      'ZUERST alle 3 Fragen lesen (Fragewort + Typ erkennen), DANN Audio starten.',
      'Fragentypen: Person/Beruf, Ort, Zeit, Grund, nächste Handlung — erkenne sie vorab.',
      'Antworten sind oft Paraphrasen — andere Wörter, gleiche Bedeutung (z.B. "coupon" → "discount").',
      'Implizite Bedeutung: Was impliziert der Sprecher ohne es direkt zu sagen?',
      'Grafik-Fragen: Scanne die Tabelle VOR dem Audio für Orientierung.',
    ],
  },
  4: {
    title: 'Part 4 Strategie — Monologe',
    tips: [
      'ZUERST alle 3 Fragen lesen — erkenne Fragentyp: Setting? Aktion? Grafik?',
      'Erste Sätze nennen oft: Sprecher-Rolle, Thema, Ort/Setting ("Where would you hear this?").',
      'Zahlen, Namen, Daten mental notieren — sie werden direkt abgefragt.',
      'Paraphrasen beachten: Antwort im Test nutzt selten dieselben Wörter wie der Talk.',
      'Grafik-Fragen: Scanne erst, suche dann den passenden Wert im Audio.',
    ],
  },
}

function detectListeningErrorType(correctText: string): { type: string; tip: string; color: string } {
  const t = correctText.toLowerCase()
  if (/\bnot\b|\bnever\b|\bn't\b|\bno one\b|\bnobody\b/.test(t))
    return { type: 'Negation überhört', tip: 'Negationswörter wie "not" oder "never" klingen flüchtig und ändern die Bedeutung komplett.', color: '#ef4444' }
  if (/\byesterday\b|\btoday\b|\btomorrow\b|\bnext\b|\blast\b|\bthis week\b|\bmonday\b|\btuesday\b|\bwednesday\b|\bthursday\b|\bfriday\b|\bmorning\b|\bafternoon\b|\bevening\b/.test(t))
    return { type: 'Zeitangabe verwechselt', tip: 'Zeitangaben (yesterday/today/next week) klingen ähnlich und sind häufige Ablenker.', color: '#fb923c' }
  if (/\bwill\b|\bwould\b|\bshould\b|\bmust\b|\bcan't\b|\bcouldn't\b|\bwon't\b/.test(t))
    return { type: 'Modalverb verwechselt', tip: 'Modalverben (will/would/should) ändern den Sinn stark — in schneller Sprache schwer zu unterscheiden.', color: '#6366f1' }
  return { type: 'Inhalt falsch interpretiert', tip: 'Fokussiere auf das Schlüsselwort der Frage und suche es aktiv im Audio statt passiv zuzuhören.', color: '#fbbf24' }
}

const TOEIC_VOCAB: Record<string, string> = {
  postpone: 'verschieben / aufschieben',
  reschedule: 'umplanen / neu terminieren',
  deadline: 'Frist / Abgabetermin',
  budget: 'Budget / Haushalt',
  proposal: 'Vorschlag / Angebot',
  negotiate: 'verhandeln',
  contractor: 'Auftragnehmer',
  inventory: 'Inventar / Lagerbestand',
  invoice: 'Rechnung',
  reimbursement: 'Erstattung',
  renovation: 'Renovierung',
  conference: 'Konferenz / Tagung',
  promotion: 'Beförderung',
  maintenance: 'Wartung / Instandhaltung',
  complaint: 'Beschwerde',
  shipment: 'Sendung / Lieferung',
  reservation: 'Reservierung',
  supervisor: 'Vorgesetzte(r)',
  colleague: 'Kollege / Kollegin',
  appointment: 'Termin',
  quarterly: 'vierteljährlich',
  facility: 'Einrichtung / Anlage',
  equipment: 'Ausrüstung / Geräte',
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
  const rawTranscript = (c.transcript as string[]) ?? []
  // fallback: if options field contains actual text (not just 'A','B','C','D'), use it
  const optionsField = question.options as string[] | null
  const optionsAreText = optionsField && optionsField.length > 0 && optionsField[0].length > 1
  const transcript = rawTranscript.length > 0 ? rawTranscript : (optionsAreText ? optionsField! : [])
  const correct = question.answer
  const letters = ['A', 'B', 'C', 'D']

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
          {transcript.length === 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', marginBottom: 4 }}>
              <p style={{ fontSize: 12, color: '#fbbf24' }}>⚠ Transkript fehlt für diese Frage — wähle trotzdem eine Option.</p>
            </div>
          )}
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
                <span style={{ fontSize: 13, color: 'var(--fg)' }}>{transcript[i] ?? '—'}</span>
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
      {submitted && selected !== null && selected !== correct && (() => {
        const correctText = transcript['ABCD'.indexOf(correct)] ?? ''
        const err = detectListeningErrorType(correctText)
        return (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: `${err.color}10`, border: `1px solid ${err.color}30` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: err.color, padding: '2px 8px', borderRadius: 99, background: `${err.color}20`, flexShrink: 0 }}>{err.type}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{err.tip}</span>
          </div>
        )
      })()}
      {submitted && transcript.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowTranscript(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#04FF88', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            {showTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showTranscript ? 'Transkript ausblenden' : 'Transkript anzeigen'}
          </button>
          {showTranscript && (
            <div style={{ marginTop: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(4,255,136,0.06)', border: '1px solid rgba(4,255,136,0.25)' }}>
              {transcript.map((line, i) => {
                const letter = letters[i]
                const isCorrect = correct === letter
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < transcript.length - 1 ? 8 : 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: isCorrect ? '#04FF88' : 'var(--muted)', flexShrink: 0 }}>{letter}.</span>
                    <span style={{ fontSize: 12, lineHeight: 1.5, color: isCorrect ? '#04FF88' : 'var(--muted)', fontWeight: isCorrect ? 600 : 400 }}>{line}</span>
                    {isCorrect && <CheckCircle size={13} style={{ color: '#04FF88', flexShrink: 0, marginTop: 2 }} />}
                  </div>
                )
              })}
            </div>
          )}
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
  const [showTranscript, setShowTranscript] = useState(false)
  const opts = question.options as string[]
  const responses = (c.responses as string[]) ?? opts
  const correct = question.answer
  const letters = ['A', 'B', 'C']

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
      {submitted && selected !== null && selected !== correct && (() => {
        const correctIdx = 'ABC'.indexOf(correct)
        const correctText = responses[correctIdx] ?? ''
        const err = detectListeningErrorType(correctText)
        return (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: `${err.color}10`, border: `1px solid ${err.color}30` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: err.color, padding: '2px 8px', borderRadius: 99, background: `${err.color}20`, flexShrink: 0 }}>{err.type}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{err.tip}</span>
          </div>
        )
      })()}
      {submitted && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowTranscript(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#D5FD44', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            {showTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showTranscript ? 'Transkript ausblenden' : 'Transkript anzeigen'}
          </button>
          {showTranscript && (
            <div style={{ marginTop: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(213,253,68,0.06)', border: '1px solid rgba(213,253,68,0.25)' }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frage</span>
                <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 3, color: 'var(--fg)' }}>{(c.question as string) ?? '—'}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antworten</span>
                {responses.map((line, i) => {
                  const letter = letters[i]
                  const isCorrect = correct === letter
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: isCorrect ? '#D5FD44' : 'var(--muted)', flexShrink: 0 }}>{letter}.</span>
                      <span style={{ fontSize: 12, lineHeight: 1.5, color: isCorrect ? '#D5FD44' : 'var(--muted)', fontWeight: isCorrect ? 600 : 400 }}>{line}</span>
                      {isCorrect && <CheckCircle size={13} style={{ color: '#D5FD44', flexShrink: 0, marginTop: 2 }} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
  const [showTranscript, setShowTranscript] = useState(false)
  const prereadSecs = 30
  const remaining = useTimer(prereadSecs, phase === 'prereading', () => setPhase('ready'))

  // Support both grouped format (content.questions[]) and flat format (content.question + top-level options)
  const groupedQuestions = c.questions as { stem: string; options: string[]; answer: string }[] | undefined
  const questions: { stem: string; options: string[]; answer: string }[] = groupedQuestions && groupedQuestions.length > 0
    ? groupedQuestions
    : (c.question as string)
      ? [{ stem: c.question as string, options: (question.options as string[]) ?? [], answer: question.answer }]
      : []

  const graphic   = c.graphic as { type: string; title: string; headers?: string[]; rows: (string[])[] } | undefined
  const color = part === 3 ? '#fb923c' : '#AE00FF'
  const transcriptText = (c.transcript as string) ?? (c.talk as string) ?? ''
  const dialogue = c.dialogue as { speaker: string; line: string }[] | undefined

  // Compute key words from correct answer options for transcript highlighting
  const STOP_WORDS = new Set(['that', 'this', 'they', 'have', 'with', 'from', 'will', 'been', 'were', 'more', 'also', 'some', 'what', 'when', 'them', 'each', 'made', 'does', 'said', 'into', 'could', 'their', 'would', 'there', 'about', 'which', 'other', 'after', 'very', 'just', 'then', 'your', 'here'])
  const keyWords = new Set<string>()
  questions.forEach(sq => {
    const letterIdx = 'ABCD'.indexOf(sq.answer)
    const option = sq.options?.[letterIdx] ?? ''
    option.toLowerCase().split(/\s+/).forEach(w => {
      const cleaned = w.replace(/[^a-z]/g, '')
      if (cleaned.length > 3 && !STOP_WORDS.has(cleaned)) keyWords.add(cleaned)
    })
  })

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
        <div style={{ padding: '14px 16px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}40`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 13, color, fontWeight: 700 }}>📖 Fragen vorab lesen — {remaining} Sek.</p>
            <button onClick={() => setPhase('ready')} style={{ fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer' }}>Überspringen</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Scanne die Fragen nach diesen Informationen:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(part === 3
              ? ['👤 Wer spricht?', '💬 Was wollen sie?', '🔧 Problem / Lösung']
              : ['🎙 Wer spricht?', '📍 Kontext / Ort?', '🔢 Zahlen & Daten']
            ).map(chip => (
              <span key={chip} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 99,
                background: `${color}20`, color, fontWeight: 600, border: `1px solid ${color}35`,
              }}>{chip}</span>
            ))}
          </div>
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

      {/* Sub-question progress indicator */}
      {questions.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Fragen:</span>
          {questions.map((_, qi) => {
            const answered = selected[qi] !== undefined
            const isActive = !submitted && !answered
            return (
              <div key={qi} style={{
                width: answered || submitted ? 28 : 24,
                height: answered || submitted ? 28 : 24,
                borderRadius: 99,
                background: submitted ? (selected[qi] === questions[qi].answer ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.15)') : answered ? `${color}25` : 'var(--card-border)',
                border: `1.5px solid ${submitted ? (selected[qi] === questions[qi].answer ? 'rgba(74,222,128,0.6)' : 'rgba(239,68,68,0.4)') : answered ? color : isActive ? color : 'var(--card-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                color: submitted ? (selected[qi] === questions[qi].answer ? 'var(--success)' : '#ef4444') : answered ? color : 'var(--muted)',
                transition: 'all 0.2s',
              }}>{qi + 1}</div>
            )
          })}
          {!submitted && (
            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
              {Object.keys(selected).length}/{questions.length} beantwortet
            </span>
          )}
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

      {questions.length === 0 && phase === 'answering' && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: '#fbbf24' }}>⚠ Keine Teilfragen für diese Frage verfügbar — klicke "Antwort prüfen" um weiterzumachen.</p>
        </div>
      )}

      {/* Play button */}
      {(phase === 'ready') && (
        <button onClick={handlePlay}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 10, background: `${color}20`, border: `1.5px solid ${color}50`, color, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Play size={16} /> {part === 3 ? 'Gespräch abspielen' : 'Ansage abspielen'}
        </button>
      )}
      {phase === 'playing' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', borderRadius: 10, background: `${color}10` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={15} style={{ color }} />
            <p style={{ fontSize: 13, color }}>Wird abgespielt…</p>
          </div>
          <button onClick={() => setPhase('answering')}
            style={{ fontSize: 11, color, background: 'none', border: `1px solid ${color}50`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
            Überspringen
          </button>
        </div>
      )}
      {submitted && question.explanation && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}
      {submitted && (dialogue || transcriptText) && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowTranscript(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            {showTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showTranscript ? 'Transkript ausblenden' : 'Vollständiges Transkript anzeigen'}
          </button>
          {showTranscript && (
            <div style={{ marginTop: 10, padding: '14px 16px', borderRadius: 10, background: `${color}08`, border: `1px solid ${color}30` }}>
              {keyWords.size > 0 && dialogue && (
                <p style={{ fontSize: 11, color, marginBottom: 8, fontWeight: 600 }}>▶ Schlüssel-Phrasen markiert</p>
              )}
              {dialogue ? (
                dialogue.map((d, i) => {
                  const lineWords = d.line.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''))
                  const isKeyLine = lineWords.some(w => keyWords.has(w))
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10,
                      marginBottom: i < dialogue.length - 1 ? 8 : 0,
                      background: isKeyLine ? `${color}15` : 'transparent',
                      borderLeft: isKeyLine ? `2px solid ${color}` : '2px solid transparent',
                      paddingLeft: 6, borderRadius: 4,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, minWidth: 60 }}>{d.speaker}</span>
                      <span style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--fg)' }}>{d.line}</span>
                    </div>
                  )
                })
              ) : (
                <p style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>{transcriptText}</p>
              )}
            </div>
          )}
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
  const [strategyDismissed, setStrategyDismissed] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitTarget, setExitTarget] = useState<string | null>(null)
  const startTime = useRef(Date.now())

  const sessionActive = !loading && !finished && answers.length > 0

  useEffect(() => {
    if (!sessionActive) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [sessionActive])

  const guardedNavigate = (href: string) => {
    if (!sessionActive) { router.push(href); return }
    setExitTarget(href)
    setShowExitDialog(true)
  }

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
      const c = q.content as Record<string, unknown>
      // Support both grouped (content.questions[]) and flat (content.question + top-level answer)
      const groupedQs = c.questions as { answer: string }[] | undefined
      const subQs = groupedQs && groupedQs.length > 0
        ? groupedQs
        : c.question ? [{ answer: q.answer }] : []
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
    const wrongCount = total - correct
    const avgTime = answers.length ? Math.round(answers.reduce((s, a) => s + a.timeSpentSec, 0) / answers.length) : 0
    const debriefMsg = pct >= 80
      ? 'Prüfungsreifes Niveau! Starte den nächsten Part.'
      : pct >= 60
      ? 'Guter Fortschritt — höre die falsch beantworteten Fragen nochmals im Transkript.'
      : 'Lies die Transkripte sorgfältig — so erkennst du Schlüsselwörter für die Antworten.'
    const NEXT_PARTS: Record<ListeningPart, { href: string; label: string }> = {
      1: { href: '/practice/part2', label: 'Weiter zu Part 2 üben →' },
      2: { href: '/practice/part3', label: 'Weiter zu Part 3 üben →' },
      3: { href: '/practice/part4', label: 'Weiter zu Part 4 üben →' },
      4: { href: '/test-training',  label: 'Zur Übersicht →' },
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

        {/* Post-Session Debrief */}
        <div className="card" style={{ padding: '18px 22px', marginBottom: 16, borderLeft: `3px solid ${pctColor}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Session-Auswertung</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Ø Zeit / Frage</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{avgTime}s</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Klang-gesteuert</p>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Falsch</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: pctColor }}>{wrongCount} / {total}</p>
            </div>
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: `${pctColor}10`, border: `1px solid ${pctColor}30` }}>
            <p style={{ fontSize: 12, lineHeight: 1.5 }}>
              <span style={{ color: pctColor, fontWeight: 700 }}>Empfehlung: </span>{debriefMsg}
            </p>
          </div>
        </div>

        {(() => {
          const allText = questions.map(q => {
            const c = q.content as Record<string, unknown>
            const lines: string[] = []
            const tr = c.transcript
            if (Array.isArray(tr)) lines.push(...(tr as string[]))
            else if (typeof tr === 'string') lines.push(tr)
            if (typeof c.talk === 'string') lines.push(c.talk)
            if (Array.isArray(c.dialogue)) lines.push(...(c.dialogue as {line:string}[]).map((d: {line:string}) => d.line))
            if (typeof c.question === 'string') lines.push(c.question)
            if (Array.isArray(c.responses)) lines.push(...(c.responses as string[]))
            return lines.join(' ')
          }).join(' ').toLowerCase()
          const found = Object.entries(TOEIC_VOCAB).filter(([word]) => allText.includes(word)).slice(0, 5)
          if (found.length === 0) return null
          return (
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Session-Vokabular</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>Diese TOEIC-Schlüsselwörter sind in deiner Session aufgetaucht — merke sie dir.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {found.map(([word, de]) => (
                  <div key={word} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, minWidth: 110 }}>{word}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{de}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

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

  const subQCount = isMultiQ
    ? ((q.content as Record<string, unknown>).questions as unknown[] | undefined)?.length ?? 0
    : 0
  const canSubmit = isMultiQ
    ? Object.keys(multiSelected).length > 0 || subQCount === 0
    : selected !== null

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {showExitDialog && (
        <ExitDialog
          onConfirm={() => { setShowExitDialog(false); if (exitTarget) router.push(exitTarget) }}
          onCancel={() => { setShowExitDialog(false); setExitTarget(null) }}
        />
      )}
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

      {/* Strategy hint — shown before first question, dismissible */}
      {currentIndex === 0 && !strategyDismissed && !submitted && (() => {
        const s = PART_STRATEGY[part]
        return s ? (
          <div style={{ padding: '16px 18px', borderRadius: 12, background: `${meta.color}08`, border: `1px solid ${meta.color}30`, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Lightbulb size={16} style={{ color: meta.color, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginBottom: 8 }}>{s.title}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {s.tips.map((tip, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, paddingLeft: 14, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: meta.color }}>›</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button onClick={() => setStrategyDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, padding: 2 }}>
                <X size={14} />
              </button>
            </div>
          </div>
        ) : null
      })()}

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
