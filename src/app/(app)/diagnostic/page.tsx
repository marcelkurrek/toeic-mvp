'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/client'
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, BookOpen, Headphones, Mic, PenLine, ImageOff, Lightbulb, CircleDot, Square, Play, RotateCcw, Volume2, VolumeX, Clock } from 'lucide-react'

type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'

interface Question {
  id: string
  section: Section
  part: number
  type: string
  content: Record<string, unknown>
  options: string[] | null
  answer: string
  explanation: string | null
}

interface WritingFeedbackResult { score: number; feedback: string; tips: string[] }

// Per-question state (enables back/forward navigation)
interface QState {
  selected: string | null
  openText: string
  confirmed: boolean
  wFeedback?: WritingFeedbackResult | null
}
const DEFAULT_QSTATE: QState = { selected: null, openText: '', confirmed: false }

const SECTION_ICONS: Record<Section, React.ReactNode> = {
  LISTENING: <Headphones size={16} />,
  READING:   <BookOpen size={16} />,
  SPEAKING:  <Mic size={16} />,
  WRITING:   <PenLine size={16} />,
}

const SECTION_COLORS: Record<Section, string> = {
  LISTENING: '#22d3ee',
  READING:   '#4ade80',
  SPEAKING:  '#fb923c',
  WRITING:   '#a78bfa',
}

const CEFR_COLORS: Record<string, string> = {
  A1: '#f87171', A2: '#fb923c', B1: '#fbbf24',
  B2: '#4ade80', C1: '#22d3ee', C2: '#a78bfa',
}

function cefrFromScore(score: number): string {
  if (score >= 0.90) return 'C2'
  if (score >= 0.80) return 'C1'
  if (score >= 0.65) return 'B2'
  if (score >= 0.50) return 'B1'
  if (score >= 0.35) return 'A2'
  return 'A1'
}

type Phase = 'intro' | 'quiz' | 'results'

export default function DiagnosticPage() {
  const { t } = useLang()
  const d = t.diagnostic
  const router = useRouter()

  const [phase, setPhase]         = useState<Phase>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [sections, setSections]   = useState<Section[]>([])
  const [loading, setLoading]     = useState(true)
  const [examType, setExamType]   = useState<string | null>(null)

  // Quiz state — indexed by question position
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qStates, setQStates]       = useState<Record<number, QState>>({})

  // Results
  const [levels, setLevels] = useState<Array<{ section: Section; cefr: string; score: number }>>([])
  const [saving, setSaving] = useState(false)

  // Section boundary map — which questions belong to which section
  const sectionBounds = useMemo(() => {
    const map: Partial<Record<Section, { first: number; last: number }>> = {}
    questions.forEach((q, i) => {
      if (!map[q.section]) map[q.section] = { first: i, last: i }
      else map[q.section]!.last = i
    })
    return map
  }, [questions])

  function updateQState(idx: number, patch: Partial<QState>) {
    setQStates(prev => ({ ...prev, [idx]: { ...(prev[idx] ?? DEFAULT_QSTATE), ...patch } }))
  }

  useEffect(() => {
    async function load() {
      const res  = await fetch('/api/users/me')
      const user = await res.json()
      const et: string = user.examType ?? 'FULL_CERTIFICATE'
      setExamType(et)

      const secs: Section[] = et === 'LISTENING_READING'
        ? ['LISTENING', 'READING']
        : et === 'SPEAKING_WRITING'
          ? ['SPEAKING', 'WRITING']
          : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']
      setSections(secs)

      const qs: Question[] = []
      for (const sec of secs) {
        const r = await fetch(`/api/questions?section=${sec}&diagnostic=true`)
        const j = await r.json()
        qs.push(...(j.questions ?? []))
      }
      setQuestions(qs)
      setLoading(false)
    }
    load()
  }, [])

  const currentQ  = questions[currentIdx]
  const curState  = qStates[currentIdx] ?? DEFAULT_QSTATE
  const selected  = curState.selected
  const openText  = curState.openText
  const confirmed = curState.confirmed
  const isMC      = Array.isArray(currentQ?.options) && (currentQ.options as string[]).length > 0
  const isLast    = currentIdx === questions.length - 1

  function handleConfirm() {
    if (!currentQ) return
    updateQState(currentIdx, { confirmed: true })
    if (currentQ.section === 'WRITING' && !isMC && openText.trim()) {
      const c = currentQ.content
      const keywords = (c.keywords as string[] | undefined) ?? []
      fetch('/api/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: openText, questionType: currentQ.type, keywords }),
      })
        .then(r => r.json())
        .then((data: WritingFeedbackResult) => updateQState(currentIdx, { wFeedback: data }))
        .catch(() => {})
    }
  }

  function handleNext() {
    if (isLast) finalize()
    else setCurrentIdx(i => i + 1)
  }

  function handleBack() {
    setCurrentIdx(i => Math.max(0, i - 1))
  }

  function handleSkip() {
    // Move forward without recording an answer
    if (isLast) finalize()
    else setCurrentIdx(i => i + 1)
  }

  async function finalize() {
    setSaving(true)
    setPhase('results')

    const mcAnswers:   Array<{ questionId: string; section: Section; isCorrect: boolean; userAnswer: string }> = []
    const openScores:  Array<{ section: Section; cefr: string; score: number }> = []

    questions.forEach((q, i) => {
      const st = qStates[i] ?? DEFAULT_QSTATE
      const isOpenQ = !Array.isArray(q.options) || q.options.length === 0

      if (!isOpenQ) {
        mcAnswers.push({
          questionId: q.id,
          section:    q.section,
          isCorrect:  st.confirmed && st.selected === q.answer,
          userAnswer: st.confirmed ? (st.selected ?? '') : '',
        })
      } else if (st.confirmed && st.openText.trim()) {
        const words = st.openText.trim().split(/\s+/).filter(Boolean).length
        const score = Math.min(words / 150, 1)
        openScores.push({ section: q.section, cefr: cefrFromScore(score), score })
      }
    })

    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcAnswers, openScores }),
      })
      if (res.ok) {
        const data = await res.json()
        setLevels(data.levels ?? openScores)
      } else {
        setLevels(openScores)
      }
    } catch {
      setLevels(openScores)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--muted)' }}>Laden…</p>
      </div>
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 56 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 8 }}>{d.heading}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>{d.subheading}</p>
        </div>

        <div className="card" style={{ padding: '32px 28px', marginBottom: 24 }}>
          <h2 className="font-semibold text-lg" style={{ marginBottom: 12 }}>{d.intro.title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{d.intro.desc}</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${sections.length}, 1fr)`,
            gap: 10,
          }}>
            {sections.map(sec => (
              <div key={sec} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '14px 10px', borderRadius: 10,
                background: `${SECTION_COLORS[sec]}12`,
                border: `1px solid ${SECTION_COLORS[sec]}35`,
              }}>
                <span style={{ color: SECTION_COLORS[sec] }}>{SECTION_ICONS[sec]}</span>
                <span className="text-xs font-semibold" style={{ color: SECTION_COLORS[sec] }}>
                  {d.section[sec]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full" style={{ height: 52, fontSize: 16 }}
          onClick={() => setPhase('quiz')}>
          {d.intro.startBtn}
        </button>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 8 }}>{d.results.heading}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>{d.results.subheading}</p>
        </div>

        {saving ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)' }}>{d.saving}</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {levels.map(lv => {
                const color = SECTION_COLORS[lv.section]
                const cefrColor = CEFR_COLORS[lv.cefr] ?? 'var(--accent)'
                return (
                  <div key={lv.section} className="card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color }}>{SECTION_ICONS[lv.section]}</span>
                        <span className="font-semibold">{d.section[lv.section]}</span>
                      </div>
                      <span className="font-bold text-xl" style={{ color: cefrColor }}>{lv.cefr}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--card-border)', marginBottom: 8 }}>
                      <div className="h-full rounded-full" style={{ width: `${lv.score * 100}%`, background: color }} />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{d.results.cefrDesc[lv.cefr as keyof typeof d.results.cefrDesc]}</p>
                  </div>
                )
              })}
            </div>
            <button className="btn-primary w-full" style={{ height: 52, fontSize: 16 }}
              onClick={() => router.push('/dashboard')}>
              {d.results.toDashboard} <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (!currentQ) return null

  // Normalize options array → { A: text, B: text, ... }
  // Some types store the real answer text in content (not in options[]):
  //   PHOTOGRAPH        → content.transcript
  //   QUESTION_RESPONSE → content.responses
  const rawOpts = currentQ.options as string[] | null
  const opts: Record<string, string> | null = rawOpts && rawOpts.length > 0
    ? Object.fromEntries(rawOpts.map((v, i) => {
        const letter = String.fromCharCode(65 + i)
        const c = currentQ.content as Record<string, unknown>
        const textArray =
          currentQ.type === 'PHOTOGRAPH'        ? (c.transcript as string[] | undefined) ?? [] :
          currentQ.type === 'QUESTION_RESPONSE' ? (c.responses  as string[] | undefined) ?? [] :
          null
        return [letter, textArray ? (textArray[i] ?? v) : v]
      }))
    : null

  const color = SECTION_COLORS[currentQ.section]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 32 }}>

      {/* ── Section step indicator ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {sections.map((sec, i) => {
          const bounds  = sectionBounds[sec]
          const isDone  = bounds ? currentIdx > bounds.last  : false
          const isActive = bounds ? currentIdx >= bounds.first && currentIdx <= bounds.last : false
          const secColor = SECTION_COLORS[sec]
          const Icon = sec === 'LISTENING' ? Headphones : sec === 'READING' ? BookOpen : sec === 'SPEAKING' ? Mic : PenLine

          return (
            <div key={sec} style={{ display: 'flex', alignItems: 'center', flex: isActive ? 'none' : 1, minWidth: 0 }}>
              {i > 0 && (
                <div style={{
                  flex: 1, height: 1, minWidth: 8,
                  background: isDone ? `${secColor}60` : 'var(--card-border)',
                  margin: '0 6px',
                }} />
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                background: isActive ? `${secColor}18` : 'transparent',
                border: `1px solid ${isActive ? secColor : isDone ? `${secColor}40` : 'transparent'}`,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}>
                {isDone
                  ? <CheckCircle size={12} style={{ color: `${secColor}90` }} />
                  : <Icon size={12} style={{ color: isActive ? secColor : 'var(--muted)' }} />
                }
                <span className="text-xs font-medium" style={{
                  color: isActive ? secColor : isDone ? `${secColor}80` : 'var(--muted)',
                }}>
                  {d.section[sec]}
                </span>
                {bounds && (
                  <span className="text-xs" style={{ color: isActive ? secColor : 'var(--muted)', opacity: 0.6 }}>
                    {bounds.last - bounds.first + 1}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        <span className="text-sm" style={{ color: 'var(--muted)', marginLeft: 'auto', paddingLeft: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {d.question.replace('{current}', String(currentIdx + 1)).replace('{total}', String(questions.length))}
        </span>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'var(--card-border)', marginBottom: 24 }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIdx / questions.length) * 100}%`, background: color }} />
      </div>

      {/* ── Question card ──────────────────────────────────────────── */}
      <div className="card" style={{ padding: '0 0 24px', overflow: 'hidden' }}>
        {/* Task type header */}
        <TaskHeader question={currentQ} color={color} />
        <div style={{ padding: '20px 28px 0' }}>
        <QuestionDisplay question={currentQ} />

        {/* MC options */}
        {opts && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {Object.entries(opts).map(([letter, text]) => {
              const isSelected = selected === letter
              const isCorrect  = confirmed && letter === currentQ.answer
              const isWrong    = confirmed && isSelected && letter !== currentQ.answer

              return (
                <button key={letter}
                  onClick={() => !confirmed && updateQState(currentIdx, { selected: letter })}
                  disabled={confirmed}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10, textAlign: 'left', width: '100%',
                    border: `2px solid ${isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : isSelected ? color : 'var(--card-border)'}`,
                    background: isCorrect ? 'rgba(74,222,128,0.1)' : isWrong ? 'rgba(248,113,113,0.1)' : isSelected ? `${color}18` : 'transparent',
                    cursor: confirmed ? 'default' : 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}>
                  <span className="font-bold text-sm" style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0, fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : isSelected ? color : 'var(--card-border)',
                    color: isSelected || isCorrect || isWrong ? '#0d1b2a' : 'var(--muted)',
                  }}>{letter}</span>
                  <span className="text-sm" style={{ flex: 1 }}>{text}</span>
                  {isCorrect && <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                  {isWrong   && <XCircle    size={16} style={{ color: 'var(--error)',   flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        )}

        {/* Open-ended: audio recorder for SPEAKING, textarea for WRITING */}
        {!opts && currentQ.section === 'SPEAKING' && (
          <div style={{ marginTop: 20 }}>
            <SpeakingHints questionType={currentQ.type} />
            <AudioRecorder
              key={currentQ.id}
              disabled={confirmed}
              onRecorded={(blob, transcript) => updateQState(currentIdx, { openText: blob ? (transcript || 'recorded') : '' })}
              expectedText={currentQ.type === 'READ_ALOUD' ? currentQ.content.text as string : undefined}
              questionType={currentQ.type}
              prepSeconds={(currentQ.content.prepSeconds as number | undefined) ?? 0}
              maxSeconds={(currentQ.content.speakSeconds as number | undefined) ?? 0}
            />
          </div>
        )}
        {!opts && currentQ.section === 'WRITING' && (
          <div style={{ marginTop: 20 }}>
            <WritingHints questionType={currentQ.type} />
            {!confirmed && getWritingTimeLimitSeconds(currentQ.type) > 0 && (
              <WritingTimer
                key={currentIdx}
                totalSeconds={getWritingTimeLimitSeconds(currentQ.type)}
                onExpire={handleConfirm}
              />
            )}
            <textarea
              value={openText}
              onChange={e => updateQState(currentIdx, { openText: e.target.value })}
              disabled={confirmed}
              placeholder={d.typeAnswer}
              rows={currentQ.type === 'OPINION_ESSAY' ? 10 : 6}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: 'var(--input-bg)',
                border: `1px solid ${confirmed ? color : 'var(--card-border)'}`,
                color: 'var(--foreground)', fontSize: 14, lineHeight: 1.6,
                resize: 'vertical', outline: 'none',
              }}
            />
            {confirmed && curState.wFeedback && (
              <WritingFeedbackPanel result={curState.wFeedback} />
            )}
            {confirmed && curState.wFeedback === undefined && currentQ.section === 'WRITING' && openText.trim() && (
              <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>Feedback wird geladen…</p>
            )}
          </div>
        )}

        {/* Explanation */}
        {confirmed && currentQ.explanation && (
          <div style={{
            marginTop: 20,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(251,191,36,0.35)',
            boxShadow: '0 2px 8px rgba(251,191,36,0.08)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: 'rgba(251,191,36,0.15)',
              borderBottom: '1px solid rgba(251,191,36,0.25)',
            }}>
              <Lightbulb size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: '#fbbf24', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Erklärung
              </span>
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(251,191,36,0.05)' }}>
              <p className="text-sm" style={{ color: 'var(--foreground)', lineHeight: 1.7, margin: 0 }}>
                {currentQ.explanation}
              </p>
            </div>
          </div>
        )}

        {/* ── Action buttons ─────────────────────────────────────── */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Back */}
          <button
            onClick={handleBack}
            disabled={currentIdx === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 40, paddingInline: 16, borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: '1px solid var(--card-border)',
              background: 'transparent',
              color: currentIdx === 0 ? 'var(--muted)' : 'var(--foreground)',
              cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIdx === 0 ? 0.4 : 1,
              transition: 'opacity 0.15s',
            }}>
            <ChevronLeft size={16} /> {d.goBack}
          </button>

          {/* Right-side actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!confirmed && (
              <button
                onClick={handleSkip}
                style={{
                  height: 40, paddingInline: 18, borderRadius: 8, fontSize: 14, fontWeight: 500,
                  border: '1px solid var(--card-border)',
                  background: 'transparent', color: 'var(--muted)',
                  cursor: 'pointer', transition: 'color 0.15s',
                }}>
                {d.skipQuestion}
              </button>
            )}
            {!confirmed ? (
              <button className="btn-primary"
                disabled={opts ? !selected : !openText.trim()}
                onClick={handleConfirm}
                style={{ height: 40, paddingInline: 22, fontSize: 14 }}>
                {d.submitAnswer}
              </button>
            ) : (
              <button className="btn-primary"
                onClick={handleNext}
                style={{ height: 40, paddingInline: 22, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {isLast ? d.results.heading : d.nextQuestion} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
        </div>{/* end padding wrapper */}
      </div>
    </div>
  )
}

const TASK_META: Record<string, { part: string; title: string; instruction: string }> = {
  // Listening
  PHOTOGRAPH:        { part: 'Part 1', title: 'Photographs',         instruction: 'Select the one statement that best describes what you see in the picture. Statements are spoken only one time and are not printed.' },
  QUESTION_RESPONSE: { part: 'Part 2', title: 'Question-Response',   instruction: 'Select the best response to the question or statement. The question and responses are spoken only one time and are not printed.' },
  CONVERSATION:      { part: 'Part 3', title: 'Conversations',       instruction: 'Select the best response to each question. The conversation is not printed and will be spoken only one time.' },
  TALK:              { part: 'Part 4', title: 'Talks',               instruction: 'Select the best response to each question. The talk is not printed and will be spoken only one time.' },
  // Reading
  INCOMPLETE_SENTENCE: { part: 'Part 5', title: 'Incomplete Sentences',    instruction: 'A word or phrase is missing. Select the best answer (A), (B), (C), or (D) to complete the sentence.' },
  TEXT_COMPLETION:     { part: 'Part 6', title: 'Text Completion',          instruction: 'A word, phrase, or sentence is missing. Select the best answer (A), (B), (C), or (D) to complete the text.' },
  SINGLE_PASSAGE:      { part: 'Part 7', title: 'Reading Comprehension',    instruction: 'Read the text and select the best answer (A), (B), (C), or (D) for each question.' },
  DOUBLE_PASSAGE:      { part: 'Part 7', title: 'Double Passages',          instruction: 'Read both texts and select the best answer (A), (B), (C), or (D) for each question.' },
  TRIPLE_PASSAGE:      { part: 'Part 7', title: 'Triple Passages',          instruction: 'Read all three texts and select the best answer (A), (B), (C), or (D) for each question.' },
  // Speaking
  READ_ALOUD:      { part: 'Part 1', title: 'Read Aloud',               instruction: 'Read the text aloud. You have 45 seconds to prepare and 45 seconds to speak.' },
  DESCRIBE_PICTURE:{ part: 'Part 2', title: 'Describe a Picture',       instruction: 'Describe the picture in as much detail as you can. You have 45 seconds to prepare and 30 seconds to speak.' },
  RESPOND_FREE:    { part: 'Part 3', title: 'Respond to Questions',     instruction: 'Respond to each question. You will have a short time to prepare before each response.' },
  RESPOND_INFO:    { part: 'Part 4', title: 'Respond Using Information',instruction: 'Use the information provided to respond to each question.' },
  EXPRESS_OPINION: { part: 'Part 5', title: 'Express an Opinion',       instruction: 'Give your opinion on the topic. You have 45 seconds to prepare and 60 seconds to speak.' },
  // Writing
  WRITE_SENTENCE:  { part: 'Part 1', title: 'Write a Sentence',         instruction: 'Write ONE sentence using both words or phrases provided. You may change the word forms and use them in any order.' },
  RESPOND_EMAIL:   { part: 'Part 2', title: 'Respond to a Written Request', instruction: 'Read the e-mail and write a response. In your e-mail, make at least TWO requests or ask TWO questions. You have 10 minutes.' },
  OPINION_ESSAY:   { part: 'Part 3', title: 'Write an Essay',           instruction: 'Give your opinion about the topic. Support your opinion with reasons and/or examples. Write at least 300 words. You have 30 minutes.' },
}

function TaskHeader({ question, color }: { question: Question; color: string }) {
  const meta = TASK_META[question.type]
  if (!meta) return null
  const hasGraphic = !!(question.content as Record<string, unknown>).graphic
  return (
    <div style={{
      padding: '14px 28px',
      borderBottom: `1px solid ${color}25`,
      background: `${color}08`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <span style={{
        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
        background: `${color}20`, color, letterSpacing: '0.04em', whiteSpace: 'nowrap',
      }}>
        {meta.part}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className="font-semibold text-sm" style={{ color }}>{meta.title}</p>
        <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
          {hasGraphic ? <><span style={{ color, fontWeight: 600 }}>Look at the graphic.</span>{' '}</> : null}
          {meta.instruction}
        </p>
      </div>
    </div>
  )
}

type Graphic = { type: string; title?: string; headers?: string[] | null; rows: string[][] }

function GraphicDisplay({ graphic }: { graphic: Graphic }) {
  return (
    <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--card-border)' }}>
      {graphic.title && (
        <div style={{ padding: '6px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--card-border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>
            {graphic.title.toUpperCase()}
          </p>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        {graphic.headers && graphic.headers.length > 0 && (
          <thead>
            <tr>
              {graphic.headers.map((h, i) => (
                <th key={i} style={{
                  padding: '6px 10px', background: 'var(--surface)', fontWeight: 600,
                  textAlign: 'left', borderBottom: '1px solid var(--card-border)', color: 'var(--muted)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {graphic.rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < graphic.rows.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 10px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type AnalysisResult = {
  complete: boolean
  completenessPercent: number
  feedback: string
  missingPortion: string | null
}

function getWritingTimeLimitSeconds(type: string): number {
  if (type === 'WRITE_SENTENCE') return 480   // 8 Minuten
  if (type === 'RESPOND_EMAIL')  return 600   // 10 Minuten
  if (type === 'OPINION_ESSAY')  return 1800  // 30 Minuten
  return 0
}

function WritingTimer({ totalSeconds, onExpire }: { totalSeconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (remaining <= 0) { onExpireRef.current(); return }
    const id = setTimeout(() => setRemaining(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  const pct   = (remaining / totalSeconds) * 100
  const color = remaining > totalSeconds * 0.4 ? 'var(--success)' : remaining > totalSeconds * 0.2 ? '#fbbf24' : 'var(--error)'
  const mins  = Math.floor(remaining / 60)
  const secs  = remaining % 60

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${color}50`, marginBottom: 12 }}>
      <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${color}10` }}>
        <span className="text-xs font-semibold" style={{ color, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} /> VERBLEIBEND
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--card-border)' }}>
        <div style={{ height: '100%', background: color, transition: 'width 1s linear', width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── WritingHints + WritingFeedbackPanel ───────────────────────────────────────
const WRITING_HINTS: Partial<Record<string, { label: string; items: string[] }>> = {
  WRITE_SENTENCE: {
    label: 'Tipps: Write a Sentence',
    items: [
      'Schreiben Sie genau EINEN vollständigen Satz',
      'Beide Keywords müssen im Satz vorkommen',
      'Beziehen Sie sich auf das Bild (was ist zu sehen?)',
      'Struktur: Subjekt + Verb + Objekt/Ergänzung',
    ],
  },
  RESPOND_EMAIL: {
    label: 'Struktur: Respond to a Written Request',
    items: [
      '"Dear Mr./Ms. [Name],"',
      '"Regarding / Concerning your [request/question], …"',
      '"I am afraid that … / I am pleased to inform you that …"',
      '"I would appreciate it if you could …"',
      '"If you have any questions, please do not hesitate to contact me."',
      '"Best regards / Kind regards,"',
    ],
  },
  OPINION_ESSAY: {
    label: 'Struktur: Opinion Essay (30 Min.)',
    items: [
      'Einleitung → "There are a number of advantages and disadvantages to … In my opinion, …"',
      'Grund 1 → "First of all, I believe … This would obviously …"',
      'Grund 2 → "Another advantage is that … Moreover, …"',
      'Gegenargument → "On the other hand, I can understand that …"',
      'Fazit → "In conclusion, although … not suit everyone, for me the benefits far outweigh the drawbacks."',
      'Ziel: 30 Min. planen, schreiben, korrigieren',
    ],
  },
}

function WritingHints({ questionType }: { questionType: string }) {
  const [open, setOpen] = useState(false)
  const hint = WRITING_HINTS[questionType]
  if (!hint) return null
  return (
    <div style={{ marginBottom: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.25)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'rgba(99,102,241,0.07)', border: 'none', cursor: 'pointer', color: '#818cf8' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <Lightbulb size={13} /> {hint.label}
        </span>
        <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ padding: '10px 14px 12px', background: 'rgba(99,102,241,0.03)' }}>
          {hint.items.map((item, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: i < hint.items.length - 1 ? 4 : 0 }}>
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function WritingFeedbackPanel({ result }: { result: WritingFeedbackResult }) {
  const scoreColor = result.score >= 80 ? 'var(--success)' : result.score >= 50 ? '#fbbf24' : 'var(--error)'
  return (
    <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: `1px solid ${scoreColor}40` }}>
      <div style={{ padding: '10px 14px', background: `${scoreColor}10`, borderBottom: `1px solid ${scoreColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="text-xs font-semibold" style={{ color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schreib-Feedback</span>
        <span className="font-bold" style={{ color: scoreColor, fontSize: 15 }}>{result.score}/100</span>
      </div>
      <div style={{ padding: '10px 14px', background: `${scoreColor}05` }}>
        <p className="text-sm" style={{ lineHeight: 1.6, marginBottom: result.tips.length > 0 ? 10 : 0 }}>{result.feedback}</p>
        {result.tips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {result.tips.map((tip, i) => (
              <p key={i} className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${scoreColor}60` }}>
                {tip}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── SpeakingHints: collapsible TOEIC phrase guide per task type ───────────────
const SPEAKING_HINTS: Partial<Record<string, { label: string; items: string[] }>> = {
  READ_ALOUD: {
    label: 'Tipps für Read Aloud',
    items: [
      'Tempo: gleichmäßig und nicht zu schnell (110–145 Wörter/Min.)',
      'Komma → kurze Pause | Punkt → klare Pause',
      'Stimme am Satzende nicht fallen lassen',
      'Wortendungen klar aussprechen: -ed, -s, -ing',
      'Zahlen und Eigennamen vorher kurz markieren',
    ],
  },
  DESCRIBE_PICTURE: {
    label: 'Struktur für Describe a Picture',
    items: [
      'Einleitung → "The picture shows …"',
      'Vordergrund → "In the foreground, …"',
      'Hintergrund → "In the background, …"',
      'Aktionen → "He seems to be … / She appears to be …"',
      'Vermutungen → "It looks like … / They might be …"',
      'Ziel: 45 Sek. sprechen – keine erfundenen Details!',
    ],
  },
  RESPOND_FREE: {
    label: 'Tipps für Respond to Questions',
    items: [
      'Ca. 15 Sekunden pro Antwort – nur auf die Frage eingehen',
      '"You can do activities such as … , which is very relaxing."',
      'Verbindungswörter: Moreover, In addition, Also',
    ],
  },
  RESPOND_EMAIL: {
    label: 'Struktur für Respond to Written Request',
    items: [
      '"Dear Mr./Ms. [Name],"',
      '"Regarding / Concerning your request, …"',
      '"I am afraid that … / I am pleased to inform you that …"',
      '"I would appreciate it if you could …"',
      '"If you have any questions, please do not hesitate to contact me."',
      '"Best regards,"',
    ],
  },
  PROPOSE_SOLUTION: {
    label: 'Struktur für Propose a Solution',
    items: [
      '1. Problem anerkennen → "I am sorry to hear that …"',
      '2. Vorgehen erklären → "We will … / I can arrange …"',
      '3. Lösung vorschlagen → "I am glad to tell you that …"',
    ],
  },
  EXPRESS_OPINION: {
    label: 'Struktur für Express an Opinion',
    items: [
      'Meinung → "I personally believe that … is better for several reasons."',
      'Grund 1 → "Firstly, I think that …"',
      'Grund 2 → "Secondly, … / Another advantage is that …"',
      'Zusatz → "Moreover, … / In addition, …"',
      'Abschluss → "In conclusion, …"',
      'Ziel: 2 Gründe + Beispiele | Klare Struktur!',
    ],
  },
}

function SpeakingHints({ questionType }: { questionType: string }) {
  const [open, setOpen] = useState(false)
  const hint = SPEAKING_HINTS[questionType]
  if (!hint) return null
  return (
    <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(251,191,36,0.25)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'rgba(251,191,36,0.08)', border: 'none', cursor: 'pointer', color: '#fbbf24' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <Lightbulb size={13} /> {hint.label}
        </span>
        <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ padding: '10px 14px 12px', background: 'rgba(251,191,36,0.04)' }}>
          {hint.items.map((item, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: i < hint.items.length - 1 ? 4 : 0 }}>
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── SpeechPlayer: TTS playback for listening questions ───────────────────────

// Voice preference order: neural/cloud voices sound most natural
const VOICE_PREFS = [
  // Microsoft Edge neural voices (best quality, available in Edge/Chrome on Windows)
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Microsoft Ava Online (Natural) - English (United States)',
  'Microsoft Andrew Online (Natural) - English (United States)',
  // Chrome/Android Google voices
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  // macOS / iOS built-in high-quality voices
  'Samantha', 'Alex', 'Karen', 'Daniel',
]

function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const en = voices.filter(v => v.lang.startsWith('en'))
  for (const name of VOICE_PREFS) {
    const v = en.find(v => v.name === name)
    if (v) return v
  }
  // Fallback: prefer remote (cloud) voices over local ones
  return en.find(v => !v.localService) ?? en[0] ?? null
}

function SpeechPlayer({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [voicesReady, setVoicesReady] = useState(false)

  useEffect(() => {
    // Voices load asynchronously on first call
    const load = () => setVoicesReady(true)
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesReady(true)
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', load)
    }
    return () => {
      window.speechSynthesis?.cancel()
      window.speechSynthesis?.removeEventListener('voiceschanged', load)
    }
  }, [])

  function play() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = 0.88
    utt.pitch = 1.0
    utt.volume = 1.0
    const voice = pickBestVoice()
    if (voice) utt.voice = voice
    utt.onend = () => setState('done')
    utt.onerror = () => setState('idle')
    setState('playing')
    window.speechSynthesis.speak(utt)
  }

  function stop() {
    window.speechSynthesis?.cancel()
    setState('idle')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(99,102,241,0.07)', border: '1.5px solid rgba(99,102,241,0.25)' }}>
      {state !== 'playing' ? (
        <button onClick={play} disabled={!voicesReady} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, cursor: voicesReady ? 'pointer' : 'default', background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.5)', color: '#818cf8', fontSize: 13, fontWeight: 600, opacity: voicesReady ? 1 : 0.5 }}>
          <Volume2 size={16} />
          {state === 'done' ? 'Wiederholen' : 'Audio abspielen'}
        </button>
      ) : (
        <button onClick={stop} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', background: 'rgba(99,102,241,0.2)', border: '1.5px solid #818cf8', color: '#818cf8', fontSize: 13, fontWeight: 600 }}>
          <VolumeX size={16} /> Stoppen
        </button>
      )}
      {state === 'playing' && (
        <span className="text-xs" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 1s infinite' }} />
          Wird abgespielt…
        </span>
      )}
      {state === 'done' && (
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Fertig</span>
      )}
    </div>
  )
}

function AudioRecorder({
  disabled,
  onRecorded,
  expectedText,
  questionType,
  prepSeconds = 0,
  maxSeconds = 0,
}: {
  disabled: boolean
  onRecorded: (blob: Blob | null, transcript: string) => void
  expectedText?: string
  questionType?: string
  prepSeconds?: number
  maxSeconds?: number
}) {
  const initialState = prepSeconds > 0 ? 'prep' : 'idle'
  const [recState, setRecState]     = useState<'prep' | 'idle' | 'recording' | 'analyzing' | 'done'>(initialState)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [timer, setTimer]           = useState(0)
  const [prepTimer, setPrepTimer]   = useState(prepSeconds)
  const [liveText, setLiveText]     = useState('')
  const [analysis, setAnalysis]     = useState<AnalysisResult | null>(null)
  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognRef    = useRef<any>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullTextRef  = useRef('')
  const durationRef  = useRef(0)

  // Prep countdown
  useEffect(() => {
    if (recState !== 'prep') return
    if (prepTimer <= 0) { setRecState('idle'); return }
    const id = setTimeout(() => setPrepTimer(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [recState, prepTimer])

  // Recording timer + auto-stop
  useEffect(() => {
    if (recState === 'recording') {
      setTimer(0)
      durationRef.current = 0
      timerRef.current = setInterval(() => {
        setTimer(t => {
          const next = t + 1
          durationRef.current = next
          if (maxSeconds > 0 && next >= maxSeconds) {
            // Auto-stop
            recognRef.current?.stop()
            recorderRef.current?.stop()
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [recState, maxSeconds])

  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  async function analyze(transcript: string) {
    setRecState('analyzing')
    try {
      const res = await fetch('/api/speech-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, expectedText, questionType, durationSeconds: durationRef.current }),
      })
      const data: AnalysisResult = await res.json()
      setAnalysis(data)
    } catch {
      setAnalysis({ complete: false, completenessPercent: 0, feedback: 'Analyse nicht verfügbar.', missingPortion: null })
    }
    setRecState('done')
  }

  async function start() {
    setError(null)
    fullTextRef.current = ''
    setLiveText('')
    setAnalysis(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        onRecorded(blob, fullTextRef.current)
        await analyze(fullTextRef.current)
      }
      recorder.start()
      recorderRef.current = recorder

      // Live speech recognition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SR) {
        const recog = new SR()
        recog.continuous = true
        recog.interimResults = true
        recog.lang = 'en-US'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recog.onresult = (e: any) => {
          let interim = ''
          let final   = ''
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript
            if (e.results[i].isFinal) final += t + ' '
            else interim += t
          }
          if (final) fullTextRef.current += final
          setLiveText(fullTextRef.current + interim)
        }
        recog.start()
        recognRef.current = recog
      }

      setRecState('recording')
    } catch {
      setError('Mikrofon konnte nicht gestartet werden. Bitte Berechtigung prüfen.')
    }
  }

  function stop() {
    recognRef.current?.stop()
    recorderRef.current?.stop()
  }

  function reset() {
    setAudioUrl(null)
    setLiveText('')
    fullTextRef.current = ''
    setAnalysis(null)
    setTimer(0)
    if (prepSeconds > 0) {
      setPrepTimer(prepSeconds)
      setRecState('prep')
    } else {
      setRecState('idle')
    }
    onRecorded(null, '')
  }

  const pct = analysis?.completenessPercent ?? 0
  const pctColor = pct >= 85 ? 'var(--success)' : pct >= 50 ? '#fbbf24' : 'var(--error)'

  if (disabled && audioUrl) {
    return (
      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        <audio src={audioUrl} controls style={{ width: '100%', borderRadius: 8 }} />
      </div>
    )
  }

  const remaining = maxSeconds > 0 ? Math.max(0, maxSeconds - timer) : null
  const remainPct = remaining !== null ? (remaining / maxSeconds) * 100 : null
  const remainColor = remaining !== null
    ? remaining > maxSeconds * 0.4 ? 'var(--success)' : remaining > maxSeconds * 0.2 ? '#fbbf24' : 'var(--error)'
    : 'var(--success)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}

      {/* ── Prep phase ── */}
      {recState === 'prep' && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.07)' }}>
          <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8' }}>
              <Play size={16} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Vorbereitungszeit</span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#818cf8', letterSpacing: 2 }}>
              {prepTimer}s
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--card-border)' }}>
            <div style={{ height: '100%', background: '#818cf8', transition: 'width 1s linear', width: `${(prepTimer / prepSeconds) * 100}%` }} />
          </div>
          <div style={{ padding: '10px 18px' }}>
            <button onClick={() => setRecState('idle')} style={{ fontSize: 12, color: '#818cf8', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Überspringen → jetzt aufnehmen
            </button>
          </div>
        </div>
      )}

      {recState === 'idle' && (
        <button onClick={start} disabled={disabled} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '16px', borderRadius: 12, width: '100%', cursor: 'pointer',
          background: 'rgba(251,113,133,0.1)', border: '2px solid rgba(251,113,133,0.4)',
          color: '#fb7185', fontSize: 15, fontWeight: 600,
        }}>
          <Mic size={20} /> Aufnahme starten
        </button>
      )}

      {recState === 'recording' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Remaining time bar */}
          {remaining !== null && (
            <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${remainColor}50` }}>
              <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${remainColor}10` }}>
                <span className="text-xs font-semibold" style={{ color: remainColor }}>VERBLEIBEND</span>
                <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: remainColor }}>{remaining}s</span>
              </div>
              <div style={{ height: 4, background: 'var(--card-border)' }}>
                <div style={{ height: '100%', background: remainColor, transition: 'width 1s linear', width: `${remainPct}%` }} />
              </div>
            </div>
          )}
          {/* Timer + stop button */}
          <button onClick={stop} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderRadius: 12, width: '100%', cursor: 'pointer',
            background: 'rgba(251,113,133,0.15)', border: '2px solid #fb7185', color: '#fb7185',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CircleDot size={18} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Aufnahme läuft</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
                {formatTime(timer)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, opacity: 0.8 }}>
                <Square size={13} /> Stoppen
              </span>
            </div>
          </button>
          {/* Live transcript */}
          {liveText && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, background: 'var(--surface)',
              border: '1px solid var(--card-border)', fontSize: 13, lineHeight: 1.6, color: 'var(--muted)',
              minHeight: 48,
            }}>
              <span className="text-xs font-semibold" style={{ display: 'block', marginBottom: 4, letterSpacing: '0.05em', color: '#fb7185' }}>
                ERKANNT
              </span>
              {liveText}
            </div>
          )}
        </div>
      )}

      {recState === 'analyzing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <Lightbulb size={16} style={{ color: '#fbbf24' }} />
          <span className="text-sm" style={{ color: '#fbbf24' }}>Aufnahme wird analysiert…</span>
        </div>
      )}

      {recState === 'done' && audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <audio src={audioUrl} controls style={{ width: '100%', borderRadius: 8 }} />

          {/* Analysis result */}
          {analysis && (
            <div style={{
              borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${pctColor}40`,
            }}>
              {/* Header with completeness bar */}
              <div style={{ padding: '10px 14px', background: `${pctColor}12`, borderBottom: `1px solid ${pctColor}25` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="text-xs font-semibold" style={{ color: pctColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vollständigkeit
                  </span>
                  <span className="font-bold" style={{ color: pctColor, fontSize: 15 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pctColor, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
              </div>
              {/* Feedback */}
              <div style={{ padding: '10px 14px', background: `${pctColor}06` }}>
                <p className="text-sm" style={{ lineHeight: 1.6, marginBottom: analysis.missingPortion ? 8 : 0 }}>
                  {analysis.feedback}
                </p>
                {analysis.missingPortion && (
                  <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--error)', marginBottom: 4 }}>NICHT GESPROCHEN:</p>
                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>„{analysis.missingPortion}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button onClick={reset} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-start',
            background: 'transparent', border: '1px solid var(--card-border)',
            color: 'var(--muted)', fontSize: 13,
          }}>
            <RotateCcw size={13} /> Neu aufnehmen
          </button>
        </div>
      )}
    </div>
  )
}

function SceneImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div style={{
        width: '100%', height: 180, borderRadius: 8, marginBottom: 12,
        background: 'var(--surface)', border: '1px solid var(--surface-border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <ImageOff size={28} style={{ color: 'var(--muted)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>Bild nicht verfügbar</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt="Scene"
      onError={() => setFailed(true)}
      style={{ width: '100%', borderRadius: 8, marginBottom: 12, maxHeight: 260, objectFit: 'cover' }}
    />
  )
}

function QuestionDisplay({ question }: { question: Question }) {
  const c = question.content

  if (question.type === 'INCOMPLETE_SENTENCE') {
    return <p className="text-base" style={{ lineHeight: 1.8 }}>{(c.question ?? c.text) as string}</p>
  }

  if (question.type === 'TEXT_COMPLETION') {
    return (
      <div>
        {(c.passage || c.intro) && (
          <div style={{
            padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
            border: '1px solid var(--card-border)', marginBottom: 16, fontSize: 13, lineHeight: 1.8,
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 8, letterSpacing: 1 }}>PASSAGE</p>
            <p style={{ whiteSpace: 'pre-line' }}>{(c.passage ?? c.intro) as string}</p>
          </div>
        )}
        <p className="text-base" style={{ lineHeight: 1.8 }}>{(c.question ?? c.text) as string}</p>
      </div>
    )
  }

  if (question.type === 'SINGLE_PASSAGE') {
    const messages = c.messages as Array<{ sender: string; time: string; text: string }> | undefined
    if (messages) {
      return (
        <div>
          <div style={{
            padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
            border: '1px solid var(--card-border)', marginBottom: 16,
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 12, letterSpacing: 1 }}>TEXT MESSAGE CHAIN</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{msg.sender}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{msg.time}</span>
                  </div>
                  <p className="text-sm" style={{ lineHeight: 1.6, padding: '6px 10px', borderRadius: 6, background: 'var(--background)' }}>{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.question as string}</p>
        </div>
      )
    }
    return (
      <div>
        <div style={{
          padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
          border: '1px solid var(--card-border)', marginBottom: 16, fontSize: 13, lineHeight: 1.8,
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 8, letterSpacing: 1 }}>PASSAGE</p>
          <p>{c.passage as string}</p>
        </div>
        <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.question as string}</p>
      </div>
    )
  }

  if (question.type === 'DOUBLE_PASSAGE' || question.type === 'TRIPLE_PASSAGE') {
    const passages = c.passages as Array<{ title: string; text: string }> | undefined
    return (
      <div>
        {passages
          ? passages.map((p, i) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
                border: '1px solid var(--card-border)', marginBottom: 12, fontSize: 13, lineHeight: 1.8,
              }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 8, letterSpacing: 1 }}>{p.title.toUpperCase()}</p>
                <p style={{ whiteSpace: 'pre-line' }}>{p.text}</p>
              </div>
            ))
          : c.passage && (
              <div style={{
                padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
                border: '1px solid var(--card-border)', marginBottom: 12, fontSize: 13, lineHeight: 1.8,
              }}>
                <p style={{ whiteSpace: 'pre-line' }}>{c.passage as string}</p>
              </div>
            )
        }
        <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.question as string}</p>
      </div>
    )
  }

  if (question.type === 'PHOTOGRAPH') {
    const statements = (c.transcript as string[] | undefined) ?? []
    const audioText = statements.length > 0
      ? statements.map((s, i) => `${String.fromCharCode(65 + i)}. ${s}`).join('  ')
      : ''
    return (
      <div>
        {c.imageUrl && <SceneImage src={c.imageUrl as string} />}
        {audioText && <SpeechPlayer text={audioText} />}
        {c.description && (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{c.description as string}</p>
        )}
      </div>
    )
  }

  if (question.type === 'QUESTION_RESPONSE') {
    const responses = (c.responses as string[] | undefined) ?? []
    const audioText = [
      c.question as string,
      ...responses.map((r, i) => `${String.fromCharCode(65 + i)}. ${r}`),
    ].join('  ')
    return (
      <div>
        <SpeechPlayer text={audioText} />
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 8, letterSpacing: 1 }}>FRAGE</p>
        <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.question as string}</p>
      </div>
    )
  }

  if (question.type === 'CONVERSATION' || question.type === 'TALK') {
    const raw = c.transcript
    const isString = typeof raw === 'string'
    const lines = Array.isArray(raw) ? raw as Array<{ speaker: string; text: string }> : []
    const audioText = isString
      ? raw as string
      : lines.map(l => `${l.speaker}. ${l.text}`).join('  ')
    const graphic = c.graphic as Graphic | undefined
    return (
      <div>
        <SpeechPlayer text={audioText} />
        {graphic && <GraphicDisplay graphic={graphic} />}
        <div style={{
          padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
          border: '1px solid var(--card-border)', marginBottom: 16,
        }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 10, letterSpacing: 1 }}>
            {question.type === 'TALK' ? 'MONOLOGUE' : 'CONVERSATION'}
          </p>
          {isString
            ? <p className="text-sm" style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{raw as string}</p>
            : lines.map((l, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent)', marginRight: 8 }}>{l.speaker}:</span>
                  <span className="text-sm" style={{ lineHeight: 1.6 }}>{l.text}</span>
                </div>
              ))
          }
        </div>
        <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.question as string}</p>
      </div>
    )
  }

  if (question.type === 'READ_ALOUD' || question.type === 'RESPOND_FREE' || question.type === 'EXPRESS_OPINION') {
    const subQs = c.questions as Array<{ id: string; text: string }> | undefined
    const instructions: Record<string, string> = {
      READ_ALOUD:      'Lesen Sie den folgenden Text laut und deutlich vor.',
      RESPOND_FREE:    'Hören Sie die folgenden Fragen und antworten Sie jeweils auf Englisch.',
      EXPRESS_OPINION: 'Geben Sie Ihre Meinung zu folgendem Thema auf Englisch.',
    }
    return (
      <div>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {instructions[question.type]}
        </p>
        {c.text && (
          <div style={{
            padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
            border: '1px solid var(--card-border)', marginBottom: 14, fontSize: 14, lineHeight: 1.8,
          }}>
            <p>{c.text as string}</p>
          </div>
        )}
        {c.scenario && (
          <div style={{
            padding: '12px 14px', borderRadius: 8, background: 'var(--surface)',
            border: '1px solid var(--card-border)', marginBottom: 14, fontSize: 13, lineHeight: 1.7,
          }}>
            <p>{c.scenario as string}</p>
          </div>
        )}
        {c.prompt && <p className="text-base font-medium" style={{ lineHeight: 1.6 }}>{c.prompt as string}</p>}
        {subQs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {subQs.map((q, i) => (
              <p key={i} className="text-base" style={{ lineHeight: 1.6 }}>
                <span className="font-semibold" style={{ color: 'var(--accent)', marginRight: 8 }}>{i + 1}.</span>
                {q.text}
              </p>
            ))}
          </div>
        )}
        {c.hints && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(c.hints as string[]).map((h, i) => (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 12,
                background: 'var(--accent-subtle)', color: 'var(--accent)',
              }}>{h}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (question.type === 'DESCRIBE_PICTURE') {
    return (
      <div>
        {c.imageUrl && <SceneImage src={c.imageUrl as string} />}
        <p className="text-base font-medium">{c.prompt as string ?? 'Describe what you see in this picture in detail.'}</p>
      </div>
    )
  }

  if (question.type === 'WRITE_SENTENCE') {
    const kw = c.keywords as string[] ?? []
    return (
      <div>
        {c.imageUrl && <SceneImage src={c.imageUrl as string} />}
        <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 10 }}>
          Write one sentence using both keywords.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {kw.map((k, i) => (
            <span key={i} style={{
              padding: '4px 12px', borderRadius: 8, fontWeight: 600,
              background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: 14,
            }}>{k}</span>
          ))}
        </div>
      </div>
    )
  }

  if (question.type === 'RESPOND_EMAIL' || question.type === 'OPINION_ESSAY') {
    const email = c.email as { from?: string; to?: string; subject?: string; body?: string } | undefined
    return (
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--muted)', marginBottom: 10 }}>
          {question.type === 'RESPOND_EMAIL' ? 'EMAIL' : 'ESSAY PROMPT'}
        </p>
        {email && (
          <div style={{
            padding: '14px 16px', borderRadius: 8, background: 'var(--surface)',
            border: '1px solid var(--card-border)', marginBottom: 14, fontSize: 13, lineHeight: 1.8,
          }}>
            {email.from    && <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--muted)' }}>From: </span>{email.from}</p>}
            {email.subject && <p style={{ marginBottom: 8 }}><span style={{ color: 'var(--muted)' }}>Subject: </span><strong>{email.subject}</strong></p>}
            {email.body    && <p style={{ borderTop: '1px solid var(--card-border)', paddingTop: 10 }}>{email.body}</p>}
          </div>
        )}
        {(c.prompt || c.instructions) && (
          <p className="text-base" style={{ lineHeight: 1.7 }}>{(c.prompt ?? c.instructions) as string}</p>
        )}
        {c.minWords && (
          <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 10 }}>
            Minimum: {c.minWords as number} words
          </p>
        )}
      </div>
    )
  }

  return <p className="text-base" style={{ lineHeight: 1.7 }}>{JSON.stringify(c)}</p>
}
