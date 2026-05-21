'use client'
import { useEffect, useState, useCallback } from 'react'
import { useExamStore } from '@/store/exam'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Zap, Lightbulb, X, AlertTriangle } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'

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

const READING_STRATEGY: Record<5 | 6 | 7, { title: string; tips: string[] }> = {
  5: {
    title: 'Part 5 Strategie — Lückentexte (Grammatik & Wortschatz)',
    tips: [
      'Bestimme zuerst die fehlende Wortart: Verb, Adjektiv, Substantiv oder Adverb?',
      'Eliminiere alle Optionen der falschen Wortart — oft bleiben 1-2 übrig.',
      'Prüfe dann: Zeitform, Aktiv/Passiv, Singular/Plural.',
      'Bei Wortschatz-Fragen: Kontext des gesamten Satzes entscheidet, nicht Übersetzung.',
    ],
  },
  6: {
    title: 'Part 6 Strategie — Textergänzung',
    tips: [
      'Lese den gesamten Text ZUERST für Gesamtkontext, dann fülle Lücken.',
      'Zeitkohärenz: Alle Verben im Text folgen einer Zeitlinie — erkenne sie.',
      'Verbindungswörter (however, therefore, moreover): achte auf logische Verbindung zum Vorhergehenden.',
      'Satzeinfügungs-Optionen: nur eine passt logisch zum Absatz davor UND danach.',
    ],
  },
  7: {
    title: 'Part 7 Strategie — PRSA-Methode',
    tips: [
      '📌 PRSA: Predict → Read → Scan → Answer — wende diese Reihenfolge bei jeder Frage an.',
      'PREDICT: Lies die Frage zuerst — was für eine Antwort erwartest du (Zahl? Name? Grund?)?',
      'READ: Lies den Text gezielt — überspringe was nicht zur Frage passt.',
      'SCAN: Suche gezielt nach Schlüsselwörtern aus der Frage oder ihren Paraphrasen im Text.',
      'ANSWER: Wähle die Option die am besten passt — Antworten sind oft Paraphrasen des Textes.',
      'NOT/EXCEPT-Fragen: 3 Optionen sind richtig, 1 ist falsch — jede Option gegen den Text prüfen.',
      'Inference-Fragen: Antwort steht NICHT direkt im Text — schließe aus dem Kontext.',
    ],
  },
}

function detectPart7QuestionType(questionText: string): { type: string; hint: string; color: string } | null {
  const q = questionText.toUpperCase()
  if (/\bNOT\b/.test(q) || /\bEXCEPT\b/.test(q))
    return { type: 'NOT/EXCEPT-Frage', hint: 'Gehe alle 4 Optionen durch — 3 sind korrekt, nur 1 ist FALSCH. Lies jede Option gegen den Text und elimiere die richtigen.', color: '#ef4444' }
  if (/\bSUGGEST|\bIMPL|\bINDICAT|\bINFER/.test(q))
    return { type: 'Inference-Frage', hint: 'Die Antwort steht nicht direkt im Text. Schließe aus dem Kontext: Was ist die logische Folgerung? Vermeide Überinterpretation.', color: '#fb923c' }
  if (/CLOSEST IN MEANING|MOST NEARLY MEANS|REFER(S)? TO/.test(q))
    return { type: 'Wortbedeutung', hint: 'Finde das Wort im Text. Setze jede Option gedanklich ein — welche passt am besten in den Kontext des Satzes?', color: '#6366f1' }
  if (/\bPURPOSE\b|\bWHY\b/.test(q))
    return { type: 'Zweck/Absicht', hint: 'Suche nach Signalwörtern: "because", "in order to", "to", "so that" in der Nähe des relevanten Abschnitts.', color: '#D5FD44' }
  if (/^WHAT |^WHERE |^WHEN |^WHO |^HOW MANY|^HOW MUCH|^WHICH /.test(q))
    return { type: 'Detail-Frage', hint: 'Direkte Faktenfrage — finde das Schlüsselwort im Text und lies die Umgebung. Die Antwort steht explizit dort.', color: '#04FF88' }
  return null
}

function detectPart6DocumentType(passage: string): { docType: string; hint: string } | null {
  const p = passage.toLowerCase()
  if (/(^|\n)subject:/m.test(p) || /(^|\n)from:/m.test(p) || /dear \w/.test(p))
    return { docType: 'E-Mail / Brief', hint: 'Achte auf Zeitkohärenz. Lücken oft: Present Perfect für aktuelle Ereignisse, Konjunktionen (however, therefore, although).' }
  if (/\bmemo\b|\bmemorandum\b/.test(p))
    return { docType: 'Memo', hint: 'Memos sind präzise und direkt. Lücken oft: Verbformen im Präsens/Futur, Verbindungswörter (additionally, as a result).' }
  if (/\bmeeting\b|\bagenda\b|\bminutes\b/.test(p))
    return { docType: 'Protokoll', hint: 'Protokolle nutzen Vergangenheitsform. Lücken oft: Passivkonstruktionen (was discussed, were agreed, has been proposed).' }
  if (/\bannounce|\bpleased to inform|\binvit/.test(p))
    return { docType: 'Ankündigung', hint: 'Ankündigungen: Präsens oder Futur. Lücken oft: Adjektive (exciting, upcoming), Adverbien (officially, proudly).' }
  if (/\breport\b|\bfindings\b|\brecommend/.test(p))
    return { docType: 'Bericht', hint: 'Berichte nutzen Passiv und Fachvokabular. Lücken oft: Passivformen (was found, were identified), Konjunktionen.' }
  return null
}

interface PracticeShellProps {
  part: 5 | 6 | 7
}

export default function PracticeShell({ part }: PracticeShellProps) {
  const router = useRouter()
  const { t } = useLang()
  const { questions, currentIndex, answers, isFinished, skippedIds, setQuestions, submitAnswer, nextQuestion, skipQuestion, reset } = useExamStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [adaptiveInfo, setAdaptiveInfo] = useState<{ difficulty: { min: number; max: number }; accuracy: number | null } | null>(null)
  const [strategyDismissed, setStrategyDismissed] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitTarget, setExitTarget] = useState<string | null>(null)

  const sessionActive = !loading && !isFinished && answers.length > 0

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

  const partInfo = t.practice.parts[part]

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    reset()
    const res = await fetch(`/api/questions?part=${part}&adaptive=true&limit=10`)
    const data = await res.json()
    setQuestions(data.questions)
    if (data.adaptive && data.difficulty) {
      setAdaptiveInfo({ difficulty: data.difficulty, accuracy: data.accuracy ?? null })
    }

    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'PART_PRACTICE', parts: [part], totalQuestions: data.questions.length }),
    })
    const sessionData = await sessionRes.json()
    setSessionId(sessionData.id)
    setLoading(false)
  }, [part, reset, setQuestions])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
  }, [currentIndex])

  useEffect(() => {
    if (!isFinished || !sessionId || saving) return
    setSaving(true)
    const score = answers.filter(a => a.isCorrect).length
    const durationSec = questions.length > 0
      ? Math.round(answers.reduce((s, a) => s + a.timeSpentSec, 0))
      : 0

    fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, maxScore: questions.length, durationSec, answers }),
    })
  }, [isFinished, sessionId, answers, questions.length, saving])

  function handleSubmit() {
    if (!selected) return
    submitAnswer(questions[currentIndex].id, selected)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 8 }}>{partInfo.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>{partInfo.desc}</p>
        <div className="card" style={{ padding: 48, marginTop: 24, textAlign: 'center', color: 'var(--muted)' }}>
          {t.practice.loading}
        </div>
      </div>
    )
  }

  if (isFinished) {
    const score = answers.filter(a => a.isCorrect).length
    const pct = Math.round(score / questions.length * 100)
    const pctColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)'

    // Session debrief: collect wrong tags
    const wrongTagMap: Record<string, number> = {}
    questions.forEach((q, i) => {
      const ans = answers[i]
      if (ans && !ans.isCorrect) {
        for (const tag of (q.tags as string[] ?? [])) {
          wrongTagMap[tag] = (wrongTagMap[tag] ?? 0) + 1
        }
      }
    })
    const topWrongTags = Object.entries(wrongTagMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
    const avgTime = answers.length ? Math.round(answers.reduce((s, a) => s + a.timeSpentSec, 0) / answers.length) : 0

    const debriefMessage = pct >= 80
      ? 'Prüfungsreifes Niveau! Du kannst Part 6 in Angriff nehmen.'
      : pct >= 60
      ? 'Guter Fortschritt — konzentriere dich morgen auf die markierten Grammatikmuster.'
      : 'Übe diese Grammatikmuster gezielt — dann schaffst du die 80%-Marke.'

    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 28 }}>{partInfo.title} — {t.practice.results}</h1>
        <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
          <div className="text-6xl font-bold mb-2" style={{ color: pctColor }}>
            {pct}%
          </div>
          <p className="text-lg mb-1">
            {t.practice.score.replace('{score}', String(score)).replace('{max}', String(questions.length))}
          </p>
          <p style={{ color: 'var(--muted)' }}>
            {pct >= 80 ? t.practice.feedback.excellent : pct >= 60 ? t.practice.feedback.good : t.practice.feedback.keep}
          </p>
        </div>

        {/* Post-Session Debrief */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24, borderLeft: `3px solid ${pctColor}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Session-Auswertung</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Ø Zeit / Frage</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>{avgTime}s</p>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Fehlerquote</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: pctColor }}>{answers.length - score} / {answers.length}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Fragen falsch</p>
            </div>
          </div>
          {/* Speed feedback */}
          {(() => {
            const TARGET_SECS: Record<number, number> = { 5: 45, 6: 75, 7: 90 }
            const target = TARGET_SECS[part]
            if (!target || !avgTime) return null
            const isOnTarget = avgTime <= target
            const ratio = Math.round((avgTime / target) * 100)
            return (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: isOnTarget ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${isOnTarget ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`, marginTop: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: isOnTarget ? 'var(--success)' : '#fbbf24', marginBottom: 3 }}>
                  ⏱ Geschwindigkeit: {avgTime}s / Frage · Ziel: {target}s
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {isOnTarget
                    ? `✓ Gut — du bist ${target - avgTime}s schneller als das TOEIC-Ziel.`
                    : `${ratio - 100}% langsamer als TOEIC-Ziel. Im echten Test wäre das kritisch.`}
                </p>
              </div>
            )
          })()}
          {topWrongTags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Grammatikmuster mit Fehlern:</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {topWrongTags.map(([tag, count]) => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 600 }}>
                    {tag} ({count}×)
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: '10px 14px', borderRadius: 8, background: `${pctColor}10`, border: `1px solid ${pctColor}30` }}>
            <p style={{ fontSize: 12, color: 'var(--fg)', lineHeight: 1.5 }}>
              <span style={{ color: pctColor, fontWeight: 700 }}>Empfehlung: </span>
              {debriefMessage}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {questions.map((q, i) => {
            const ans = answers[i]
            if (!ans) return null
            const opts = q.options as string[]
            const letters = ['A', 'B', 'C', 'D']
            return (
              <div key={q.id} className="card" style={{ padding: '20px 24px' }}>
                <div className="flex items-start gap-3" style={{ marginBottom: 12 }}>
                  {ans.isCorrect
                    ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    : <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />}
                  <p className="text-sm font-medium">{(q.content as { question: string }).question}</p>
                </div>
                <div className="ml-7 text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {opts?.map((opt, j) => {
                    const letter = letters[j]
                    const isCorrect = q.answer === letter
                    const isUser = ans.userAnswer === letter
                    return (
                      <div key={j} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-medium"
                          style={{
                            background: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--card-border)',
                            color: isCorrect || (isUser && !isCorrect) ? '#fff' : 'var(--muted)',
                          }}>
                          {letter}
                        </span>
                        <span style={{ color: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--muted)' }}>
                          {opt}
                        </span>
                      </div>
                    )
                  })}
                  {q.explanation && (
                    <p className="mt-2 text-xs p-3 rounded-lg" style={{ background: 'var(--accent-subtle)', color: 'var(--foreground)' }}>
                      <span className="font-medium" style={{ color: 'var(--accent)' }}>{t.practice.explanation}: </span>
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadQuestions} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> {t.practice.practiceAgain}
          </button>
          <button onClick={() => router.push('/progress')}
            className="text-sm font-medium rounded-lg border"
            style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>
            {t.practice.viewProgress}
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  if (!question) return null

  const opts = question.options as string[]
  const letters = ['A', 'B', 'C', 'D']
  const currentAnswer = answers[currentIndex]
  const correctLetter = question.answer

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      {showExitDialog && (
        <ExitDialog
          onConfirm={() => { setShowExitDialog(false); if (exitTarget) router.push(exitTarget) }}
          onCancel={() => { setShowExitDialog(false); setExitTarget(null) }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>{partInfo.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{partInfo.desc}</p>
            {adaptiveInfo && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: 'var(--accent-subtle)', color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <Zap size={9} /> Adaptiv · Level {adaptiveInfo.difficulty.min}–{adaptiveInfo.difficulty.max}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm font-medium rounded-full"
          style={{ padding: '4px 14px', background: 'var(--card-border)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="rounded-full overflow-hidden" style={{ height: 6, marginBottom: 28, background: 'var(--card-border)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {/* Strategy hint — shown before first question, dismissible */}
      {currentIndex === 0 && !strategyDismissed && !submitted && (() => {
        const s = READING_STRATEGY[part as 5 | 6 | 7]
        return s ? (
          <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(213,253,68,0.06)', border: '1px solid rgba(213,253,68,0.25)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Lightbulb size={16} style={{ color: '#D5FD44', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#D5FD44', marginBottom: 8 }}>{s.title}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {s.tips.map((tip, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, paddingLeft: 14, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#D5FD44' }}>›</span>
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

      <QuestionCard
        question={question}
        opts={opts}
        letters={letters}
        selected={selected}
        submitted={submitted}
        correctLetter={correctLetter}
        currentAnswer={currentAnswer}
        onSelect={setSelected}
        onSubmit={handleSubmit}
        onNext={nextQuestion}
        onSkip={skipQuestion}
        isLast={currentIndex === questions.length - 1}
        isRetry={skippedIds.includes(question.id)}
        t={t.practice}
        part={part}
      />
    </div>
  )
}

function QuestionCard({ question, opts, letters, selected, submitted, correctLetter, currentAnswer, onSelect, onSubmit, onNext, onSkip, isLast, isRetry, t, part }: {
  question: Question
  opts: string[]
  letters: string[]
  selected: string | null
  submitted: boolean
  correctLetter: string
  currentAnswer: { isCorrect: boolean } | undefined
  onSelect: (l: string) => void
  onSubmit: () => void
  onNext: () => void
  onSkip: () => void
  isLast: boolean
  isRetry: boolean
  t: { passage: string; explanation: string; correct: string; incorrect: string; submitBtn: string; nextBtn: string; resultsBtn: string }
  part: number
}) {
  const content = question.content as {
    question: string
    passage?: string
    passages?: { title?: string; label?: string; text: string }[]
  }
  const [activePassage, setActivePassage] = useState(0)
  const passages = content.passages?.map((p, i) => ({ label: p.title ?? p.label ?? `Dokument ${i + 1}`, text: p.text }))
    ?? (content.passage ? [{ label: 'Text', text: content.passage }] : [])

  const part7Hint = part === 7 ? detectPart7QuestionType(content.question) : null

  const passageForDoc = passages[0]?.text ?? ''
  const part6DocHint = part === 6 ? detectPart6DocumentType(passageForDoc) : null

  // For Part 6: highlight the active blank number in the passage
  const activeBlankMatch = content.question?.match(/\[(\d+)\]/)
  const activeBlankTag   = activeBlankMatch ? `[${activeBlankMatch[1]}]` : null

  function renderPassageWithHighlight(text: string) {
    if (!activeBlankTag) return <p className="whitespace-pre-wrap">{text}</p>
    const parts = text.split(activeBlankTag)
    return (
      <p className="whitespace-pre-wrap">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <mark style={{ background: 'var(--accent)', color: '#0d1b2a', borderRadius: 3, padding: '0 4px', fontWeight: 700 }}>
                {activeBlankTag}
              </mark>
            )}
          </span>
        ))}
      </p>
    )
  }

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      {passages.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          {passages.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {passages.map((p, i) => (
                <button key={i} onClick={() => setActivePassage(i)} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, border: '1.5px solid',
                  borderColor: activePassage === i ? 'var(--accent)' : 'var(--card-border)',
                  background: activePassage === i ? 'var(--accent-subtle)' : 'transparent',
                  color: activePassage === i ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer',
                }}>{p.label}</button>
              ))}
            </div>
          )}
          <div className="rounded-lg text-sm leading-relaxed"
            style={{ background: 'var(--background)', borderLeft: '3px solid var(--accent)', color: 'var(--foreground)', padding: '16px 18px' }}>
            {passages.length === 1 && <p className="text-xs font-medium" style={{ color: 'var(--muted)', marginBottom: 8 }}>{t.passage}</p>}
            {renderPassageWithHighlight(passages[activePassage]?.text ?? '')}
          </div>
        </div>
      )}

      {part6DocHint && !submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(213,253,68,0.07)', border: '1px solid rgba(213,253,68,0.25)', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#D5FD44', padding: '2px 8px', borderRadius: 99, background: 'rgba(213,253,68,0.15)', flexShrink: 0 }}>{part6DocHint.docType}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{part6DocHint.hint}</span>
        </div>
      )}
      {part7Hint && !submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: `${part7Hint.color}0d`, border: `1px solid ${part7Hint.color}35`, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: part7Hint.color, padding: '2px 8px', borderRadius: 99, background: `${part7Hint.color}20`, flexShrink: 0 }}>{part7Hint.type}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{part7Hint.hint}</span>
        </div>
      )}

      <p className="text-base font-medium leading-relaxed" style={{ marginBottom: 22 }}>{content.question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {opts?.map((opt, i) => {
          const letter = letters[i]
          const isSelected = selected === letter
          const isCorrect = submitted && letter === correctLetter
          const isWrong = submitted && isSelected && letter !== correctLetter

          let borderColor = 'var(--card-border)'
          let bg = 'transparent'
          let textColor = 'var(--foreground)'

          if (!submitted && isSelected) { borderColor = 'var(--accent)'; bg = 'var(--accent-subtle)' }
          if (isCorrect) { borderColor = 'var(--success)'; bg = 'rgba(34,197,94,0.1)'; textColor = 'var(--success)' }
          if (isWrong) { borderColor = 'var(--error)'; bg = 'rgba(239,68,68,0.1)'; textColor = 'var(--error)' }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onSelect(letter)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all border"
              style={{ borderColor, background: bg, color: textColor }}
            >
              <span className="w-7 h-7 rounded shrink-0 flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--card-border)', color: textColor }}>
                {letter}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          )
        })}
      </div>

      {submitted && question.explanation && (
        <div className="rounded-lg text-sm"
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '14px 16px', marginBottom: 12 }}>
          <p className="font-medium" style={{ color: 'var(--accent)', marginBottom: 6 }}>{t.explanation}</p>
          <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{question.explanation}</p>
        </div>
      )}
      {submitted && question.tags && question.tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grammatik:</span>
          {(question.tags as string[]).map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(213,253,68,0.15)', color: '#D5FD44', border: '1px solid rgba(213,253,68,0.3)', fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {isRetry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '6px 10px', borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <RotateCcw size={12} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>Wiederholung — zuvor übersprungen</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {submitted && (
            <span className="text-sm font-medium flex items-center gap-2" style={{
              color: currentAnswer?.isCorrect ? 'var(--success)' : 'var(--error)'
            }}>
              {currentAnswer?.isCorrect
                ? <><CheckCircle size={16} /> {t.correct}</>
                : <><XCircle size={16} /> {t.incorrect.replace('{letter}', correctLetter)}</>}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!submitted && !isLast && !isRetry && (
            <button onClick={onSkip} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}>
              Überspringen
            </button>
          )}
          {!submitted ? (
            <button onClick={onSubmit} disabled={!selected} className="btn-primary">
              {t.submitBtn}
            </button>
          ) : (
            <button onClick={onNext} className="btn-primary flex items-center gap-2">
              {isLast ? t.resultsBtn : t.nextBtn} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
