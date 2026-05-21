'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react'
import FeedbackScorecard from './FeedbackScorecard'

type WritingPart = 'sentences' | 'email' | 'essay'

interface Question {
  id: string
  type: string
  content: Record<string, unknown>
  answer: string
  explanation: string | null
}

interface WritingFeedback {
  score: number
  feedback: string
  tips: string[]
  dimensions?: { content: number; structure: number; grammar: number; vocabulary: number }
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
  sentences: { label: 'Task 1–5: Sätze schreiben',   color: '#AE00FF', desc: 'Schreibe einen grammatikalisch korrekten Satz. Verwende beide vorgegebenen Wörter.', timeSec: 8 * 60,  minWords: 5,   targetWords: 15  },
  email:     { label: 'Task 6–7: E-Mail verfassen',   color: '#fb923c', desc: 'Beantworte die E-Mail vollständig mit angemessener Geschäftssprache.',                timeSec: 10 * 60, minWords: 60,  targetWords: 100 },
  essay:     { label: 'Task 8: Opinion Essay',        color: '#6366f1', desc: 'Schreibe einen strukturierten Essay (mind. 300 Wörter) mit klarer Meinung.',          timeSec: 30 * 60, minWords: 250, targetWords: 300 },
}

const WRITING_DIMS = [
  { key: 'content'   as const, label: 'Inhalt & Relevanz', color: '#04FF88' },
  { key: 'structure' as const, label: 'Struktur',          color: '#D5FD44' },
  { key: 'grammar'   as const, label: 'Grammatik',         color: '#fb923c' },
  { key: 'vocabulary'as const, label: 'Wortschatz',        color: '#AE00FF' },
]

const EMAIL_PHRASES = [
  { cat: 'Eröffnung', phrases: ['I am writing to...', 'With reference to your email...', 'I am contacting you regarding...', 'Further to our recent conversation...'] },
  { cat: 'Anfrage/Bitte', phrases: ['Could you please...', 'I would be grateful if you could...', 'I would appreciate it if...', 'Would it be possible to...'] },
  { cat: 'Beschwerde', phrases: ['I am writing to express my concern about...', 'I would like to bring to your attention...', 'Unfortunately, I am not satisfied with...', 'I was disappointed to find that...'] },
  { cat: 'Abschluss', phrases: ['I look forward to hearing from you.', 'Please do not hesitate to contact me.', 'Thank you for your prompt attention to this matter.', 'I would appreciate a response at your earliest convenience.'] },
]

const ESSAY_PHRASES = [
  { cat: 'Einleitung', phrases: ["In today's society, ... is becoming increasingly important.", 'There is much debate about whether...', 'Many people believe that...', 'The question of ... is a topic that deserves careful consideration.'] },
  { cat: 'Argument', phrases: ['One key reason for this is...', 'Furthermore, it should be noted that...', 'This is supported by the fact that...', 'Another important point is...'] },
  { cat: 'Beispiel', phrases: ['For example,...', 'A clear illustration of this is...', 'Consider the case of...', 'This can be seen in...'] },
  { cat: 'Schluss', phrases: ['In conclusion,...', 'To sum up,...', 'For these reasons, I believe that...', 'Taking everything into account,...'] },
]

function PhraseBaukasten({ type, color }: { type: 'email' | 'essay'; color: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const groups = type === 'email' ? EMAIL_PHRASES : ESSAY_PHRASES
  const copyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase).catch(() => {})
    setCopied(phrase)
    setTimeout(() => setCopied(null), 1500)
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}35`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}>
        <span>Phrase-Baukasten</span>
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>{open ? '▲ Einklappen' : '▼ Ausklappen'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 10, background: 'var(--background)', border: `1px solid ${color}25` }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Klicke auf eine Phrase zum Kopieren in die Zwischenablage</p>
          {groups.map(({ cat, phrases }) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {phrases.map(phrase => (
                  <button key={phrase} onClick={() => copyPhrase(phrase)} style={{
                    fontSize: 12, textAlign: 'left', padding: '6px 10px', borderRadius: 6,
                    border: `1px solid ${copied === phrase ? color : 'var(--card-border)'}`,
                    background: copied === phrase ? `${color}15` : 'var(--card)',
                    color: copied === phrase ? color : 'var(--foreground)',
                    cursor: 'pointer', fontStyle: 'italic',
                  }}>
                    {copied === phrase ? '✓ Kopiert!' : phrase}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
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

function useDraftAutosave(key: string, text: string, submitted: boolean) {
  const [draftFound, setDraftFound] = useState<string | null>(null)
  const [draftDismissed, setDraftDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(key)
    if (saved && saved.length > 0) setDraftFound(saved)
  }, [key])

  useEffect(() => {
    if (submitted || typeof window === 'undefined') return
    const timer = setTimeout(() => {
      if (text.length > 0) localStorage.setItem(key, text)
    }, 10000)
    return () => clearTimeout(timer)
  }, [text, key, submitted])

  useEffect(() => {
    if (submitted && typeof window !== 'undefined') localStorage.removeItem(key)
  }, [submitted, key])

  const dismiss = () => { setDraftDismissed(true); setDraftFound(null) }
  const restore = () => { setDraftDismissed(true); return draftFound ?? '' }
  return { draftFound: draftDismissed ? null : draftFound, dismiss, restore }
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

function AnnotatedPhraseFeedback({ userText, taskType, color }: { userText: string; taskType: 'email' | 'essay'; color: string }) {
  const phraseGroups = taskType === 'email' ? EMAIL_PHRASES : ESSAY_PHRASES
  const STRUCTURAL_CONNECTORS = ['first', 'furthermore', 'however', 'in addition', 'therefore', 'consequently', 'in conclusion', 'to sum up', 'on the other hand', 'for example', 'for instance', 'in my opinion', 'i believe', 'i strongly believe']

  const lowerText = userText.toLowerCase()

  // Find matched phrases from banks
  const matched: { phrase: string; cat: string }[] = []
  phraseGroups.forEach(({ cat, phrases }) => {
    phrases.forEach(phrase => {
      if (lowerText.includes(phrase.toLowerCase().slice(0, 20))) {
        matched.push({ phrase, cat })
      }
    })
  })

  // Find structural connectors used
  const usedConnectors = STRUCTURAL_CONNECTORS.filter(c => lowerText.includes(c))

  if (matched.length === 0 && usedConnectors.length === 0) return null

  return (
    <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--background)', border: '1px solid var(--card-border)', marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Deine Text-Analyse</p>
      {matched.length > 0 && (
        <div style={{ marginBottom: usedConnectors.length > 0 ? 10 : 0 }}>
          <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginBottom: 6 }}>✓ Gute Phrasen erkannt ({matched.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {matched.map(({ phrase, cat }) => (
              <div key={phrase} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(74,222,128,0.15)', color: 'var(--success)', fontWeight: 600, flexShrink: 0 }}>{cat}</span>
                <span style={{ fontSize: 12, color: 'var(--fg)', fontStyle: 'italic' }}>{phrase}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {usedConnectors.length > 0 && (
        <div>
          <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 6 }}>✓ Strukturwörter verwendet ({usedConnectors.length})</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {usedConnectors.map(c => (
              <span key={c} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WritingFeedbackPanel({ fb, modelAnswer, onRevise, userText, taskType }: { fb: WritingFeedback; modelAnswer?: string; onRevise?: () => void; userText?: string; taskType?: 'email' | 'essay' }) {
  const dims = WRITING_DIMS.map(d => ({
    label: d.label,
    score: fb.dimensions?.[d.key] ?? fb.score,
    color: d.color,
  }))
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ padding: '16px 20px', borderRadius: 12, background: 'var(--card)', border: '1px solid var(--card-border)', marginBottom: 12 }}>
        <FeedbackScorecard
          overall={fb.score}
          dimensions={dims}
          feedback={fb.feedback}
          complete={fb.score >= 65}
        />
      </div>
      {userText && taskType && <AnnotatedPhraseFeedback userText={userText} taskType={taskType} color="var(--accent)" />}
      {fb.tips && fb.tips.length > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOEIC-Tipps</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {fb.tips.map((tip, i) => (
              <li key={i} style={{ fontSize: 12, color: 'var(--foreground)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {modelAnswer && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Beispielantwort</p>
          <p style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.7 }}>{modelAnswer}</p>
        </div>
      )}
      {onRevise && (
        <button onClick={onRevise} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--muted)', cursor: 'pointer' }}>
          ✏️ Überarbeiten — Text verbessern
        </button>
      )}
    </div>
  )
}

// ── Sentence Task ─────────────────────────────────────────────────────────────
function SentenceTask({ question, onSubmit, submitted, feedback, timerExpired, onRevise }: {
  question: Question; onSubmit: (text: string) => void; submitted: boolean; feedback: WritingFeedback | null; timerExpired: boolean; onRevise?: () => void
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const words = countWords(text)
  const keywords = (c.keywords as string[]) ?? []
  const { draftFound, dismiss, restore } = useDraftAutosave(`writing-draft-${question.id}`, text, submitted)

  return (
    <div>
      {draftFound && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(174,0,255,0.08)', border: '1px solid rgba(174,0,255,0.25)', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#AE00FF', flex: 1 }}>Entwurf gefunden — wiederherstellen?</span>
          <button onClick={() => setText(restore())} style={{ fontSize: 12, fontWeight: 700, color: '#AE00FF', background: 'none', border: 'none', cursor: 'pointer' }}>Wiederherstellen</button>
          <button onClick={dismiss} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Verwerfen</button>
        </div>
      )}
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
      <textarea value={text} onChange={e => setText(e.target.value)} disabled={submitted || timerExpired}
        placeholder="Schreibe hier deinen Satz…" rows={3}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      <WordCounter count={words} min={5} target={12} color="#AE00FF" />
      {!submitted && !timerExpired && (
        <button onClick={() => onSubmit(text)} disabled={words < 5}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 5 ? '#AE00FF' : 'var(--card-border)', color: words >= 5 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 5 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Einreichen
        </button>
      )}
      {timerExpired && !submitted && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 13, color: '#fbbf24' }}>Zeit abgelaufen — </span>
          <button onClick={() => onSubmit(text)} style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Jetzt trotzdem einreichen
          </button>
        </div>
      )}
      {submitted && feedback && <WritingFeedbackPanel fb={feedback} modelAnswer={question.answer} onRevise={onRevise} />}
    </div>
  )
}

// ── Email Task ────────────────────────────────────────────────────────────────
function EmailTask({ question, onSubmit, submitted, feedback, timerExpired, onRevise }: {
  question: Question; onSubmit: (text: string) => void; submitted: boolean; feedback: WritingFeedback | null; timerExpired: boolean; onRevise?: () => void
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const words = countWords(text)
  const { draftFound, dismiss, restore } = useDraftAutosave(`writing-draft-${question.id}`, text, submitted)

  return (
    <div>
      {draftFound && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#fb923c', flex: 1 }}>Entwurf gefunden — wiederherstellen?</span>
          <button onClick={() => setText(restore())} style={{ fontSize: 12, fontWeight: 700, color: '#fb923c', background: 'none', border: 'none', cursor: 'pointer' }}>Wiederherstellen</button>
          <button onClick={dismiss} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Verwerfen</button>
        </div>
      )}
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
      <PhraseBaukasten type="email" color="#fb923c" />
      <textarea value={text} onChange={e => setText(e.target.value)} disabled={submitted || timerExpired}
        placeholder="Schreibe hier deine Antwort-E-Mail…" rows={8}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      <WordCounter count={words} min={60} target={100} color="#fb923c" />
      {!submitted && !timerExpired && (
        <button onClick={() => onSubmit(text)} disabled={words < 20}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 60 ? '#fb923c' : 'var(--card-border)', color: words >= 60 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 20 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Einreichen
        </button>
      )}
      {timerExpired && !submitted && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 13, color: '#fbbf24' }}>Zeit abgelaufen — </span>
          <button onClick={() => onSubmit(text)} style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Jetzt trotzdem einreichen
          </button>
        </div>
      )}
      {submitted && feedback && <WritingFeedbackPanel fb={feedback} onRevise={onRevise} userText={text} taskType="email" />}
    </div>
  )
}

// ── Essay Task ────────────────────────────────────────────────────────────────
function EssayTask({ question, onSubmit, submitted, feedback, timerExpired, onRevise }: {
  question: Question; onSubmit: (text: string) => void; submitted: boolean; feedback: WritingFeedback | null; timerExpired: boolean; onRevise?: () => void
}) {
  const c = question.content as Record<string, unknown>
  const [text, setText] = useState('')
  const [showEssayTemplate, setShowEssayTemplate] = useState(false)
  const words = countWords(text)
  const { draftFound, dismiss, restore } = useDraftAutosave(`writing-draft-${question.id}`, text, submitted)

  return (
    <div>
      {draftFound && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: '#6366f1', flex: 1 }}>Entwurf gefunden — wiederherstellen?</span>
          <button onClick={() => setText(restore())} style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Wiederherstellen</button>
          <button onClick={dismiss} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Verwerfen</button>
        </div>
      )}
      <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aufgabenstellung</p>
        <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>{(c.prompt ?? c.question) as string}</p>
      </div>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-border)', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Klare Meinung + mind. 2 Begründungen. Struktur: Einleitung → Argument 1 → Argument 2 → Schluss.
        </p>
      </div>
      <div style={{ marginBottom: 14 }}>
        <button onClick={() => setShowEssayTemplate(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '7px 13px', cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}>
          <span>Essay-Formel anzeigen</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>{showEssayTemplate ? '▲' : '▼'}</span>
        </button>
        {showEssayTemplate && (
          <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>4-Absatz TOEIC Essay-Struktur</p>
            {[
              { num: 1, title: 'Einleitung (~50 Wörter)', desc: 'These nennen + eigene Meinung klar formulieren', example: '"In my opinion, [position]. There are two main reasons why I believe this."' },
              { num: 2, title: 'Argument 1 (~80 Wörter)', desc: 'Ersten Grund nennen + erklären + Beispiel', example: '"First, [reason]. For example, [specific example]. This shows that [link to thesis]."' },
              { num: 3, title: 'Argument 2 (~80 Wörter)', desc: 'Zweiten Grund nennen + erklären + Beispiel', example: '"Furthermore, [reason]. Consider the case of [example]. Therefore, [conclusion of point]."' },
              { num: 4, title: 'Schluss (~40 Wörter)', desc: 'These wiederholen + kurze Zusammenfassung', example: '"In conclusion, [restate position]. For these reasons, I strongly believe that [thesis]."' },
            ].map(({ num, title, desc, example }) => (
              <div key={num} style={{ marginBottom: num < 4 ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', minWidth: 20 }}>{num}.</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>{title}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, paddingLeft: 28 }}>{desc}</p>
                <p style={{ fontSize: 11, fontStyle: 'italic', color: '#6366f1', paddingLeft: 28, lineHeight: 1.5 }}>{example}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <PhraseBaukasten type="essay" color="#6366f1" />
      <textarea value={text} onChange={e => setText(e.target.value)} disabled={submitted || timerExpired}
        placeholder="Schreibe hier deinen Essay (mind. 300 Wörter)…" rows={14}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.7 }}
      />
      <WordCounter count={words} min={250} target={300} color="#6366f1" />
      {words > 0 && words < 250 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <AlertTriangle size={13} style={{ color: '#fbbf24' }} />
          <p style={{ fontSize: 12, color: '#fbbf24' }}>Noch {250 - words} Wörter bis zum Minimum</p>
        </div>
      )}
      {!submitted && !timerExpired && (
        <button onClick={() => onSubmit(text)} disabled={words < 100}
          style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: words >= 250 ? '#6366f1' : 'var(--card-border)', color: words >= 250 ? '#fff' : 'var(--muted)', border: 'none', cursor: words >= 100 ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
          Essay einreichen
        </button>
      )}
      {timerExpired && !submitted && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 13, color: '#fbbf24' }}>Zeit abgelaufen — </span>
          <button onClick={() => onSubmit(text)} style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Jetzt trotzdem einreichen
          </button>
        </div>
      )}
      {submitted && feedback && <WritingFeedbackPanel fb={feedback} onRevise={onRevise} userText={text} taskType="essay" />}
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
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerExpired, setTimerExpired] = useState(false)
  const [finished, setFinished] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const timer = useCountdownTimer(meta.timeSec, timerRunning && !timerExpired)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writingPart])

  useEffect(() => {
    setSubmitted(false)
    setFeedback(null)
    setTimerExpired(false)
  }, [currentIndex])

  // When timer runs out: freeze the textarea but don't auto-submit with empty text
  useEffect(() => {
    if (timer.expired && timerRunning && !submitted) {
      setTimerRunning(false)
      setTimerExpired(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.expired])

  const handleSubmit = useCallback(async (text: string) => {
    setSubmitted(true)
    setTimerRunning(false)
    setTimerExpired(false)
    const q = questions[currentIndex]
    if (!q) return
    try {
      const res = await fetch('/api/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          questionType: q.type,
          keywords: (q.content as Record<string, unknown>).keywords,
        }),
      })
      const data = await res.json()
      setFeedback(data.error ? null : data)
      setScores(prev => [...prev, data.score ?? 0])
    } catch {
      setFeedback({ score: 0, feedback: 'Feedback konnte nicht geladen werden.', tips: [], dimensions: undefined })
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

  const handleRevise = useCallback(() => {
    setSubmitted(false)
    setFeedback(null)
    setTimerExpired(false)
  }, [])

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
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const avgColor = avg >= 75 ? 'var(--success)' : avg >= 55 ? '#fbbf24' : '#ef4444'
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 0' }}>
        <div className="card" style={{ padding: '36px 32px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
          <h2 className="text-2xl font-bold" style={{ marginBottom: 8 }}>Writing abgeschlossen!</h2>
          <p style={{ fontSize: 44, fontWeight: 800, color: avgColor, margin: '12px 0 4px' }}>{avg}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            Ø Score · {questions.length} Aufgabe{questions.length !== 1 ? 'n' : ''}
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            {avg >= 75 ? '🏆 Sehr gut! Weiter so — regelmäßiges Schreiben sichert den Score.' : avg >= 55 ? '💪 Guter Fortschritt — achte auf Struktur und Pflicht-Phrasen.' : '📚 Übe regelmäßig. Fokus: Pflicht-Vokabeln und Satzstruktur.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/test-training')}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
            Zurück
          </button>
          <button onClick={() => { setFinished(false); setCurrentIndex(0); setSubmitted(false); setFeedback(null); setTimerRunning(true); setScores([]) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: meta.color + '20', border: `1.5px solid ${meta.color}50`, color: meta.color, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <RotateCcw size={14} /> Nochmal
          </button>
          <button onClick={() => router.push('/progress')}
            style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--foreground)', cursor: 'pointer', fontSize: 14 }}>
            Fortschritt ansehen
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

      {timerExpired ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', marginBottom: 20 }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>Zeit abgelaufen — reiche deinen Text noch ein.</span>
        </div>
      ) : (
        <TimerBar mins={timer.mins} secs={timer.secs} pct={timer.pct} color={meta.color} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Aufgabe {currentIndex + 1} / {questions.length}</p>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: meta.color + '15', color: meta.color, fontWeight: 700 }}>WRITING</span>
      </div>

      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        {writingPart === 'sentences' && <SentenceTask question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} timerExpired={timerExpired} onRevise={handleRevise} />}
        {writingPart === 'email'     && <EmailTask    question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} timerExpired={timerExpired} onRevise={handleRevise} />}
        {writingPart === 'essay'     && <EssayTask    question={q} onSubmit={handleSubmit} submitted={submitted} feedback={feedback} timerExpired={timerExpired} onRevise={handleRevise} />}
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
