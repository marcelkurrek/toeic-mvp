'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Volume2, VolumeX, ChevronRight, RotateCcw, Play, Loader2 } from 'lucide-react'
import type { Question } from '@/types'

interface ListeningShellProps {
  part: 1 | 2 | 3 | 4
}

interface QuestionGroup {
  transcript: string
  questions: Question[]
}

// ── TTS helper (OpenAI) ───────────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null

function cancelTTS() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

async function playTTS(text: string, onEnd?: () => void): Promise<void> {
  cancelTTS()
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('TTS failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.() }
    audio.onerror = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.() }
    await audio.play()
  } catch {
    onEnd?.()
  }
}

// ── Group Part-3/4 questions by transcript ────────────────────────────────────
function groupByTranscript(questions: Question[]): QuestionGroup[] {
  const groups: QuestionGroup[] = []
  for (const q of questions) {
    const t = (q.content as { transcript?: string }).transcript ?? ''
    const last = groups[groups.length - 1]
    if (last && last.transcript === t) {
      last.questions.push(q)
    } else {
      groups.push({ transcript: t, questions: [q] })
    }
  }
  return groups
}

// ── Part 1: Photograph ────────────────────────────────────────────────────────
function Part1Card({
  question, onAnswer,
}: {
  question: Question
  onAnswer: (letter: string, correct: boolean) => void
}) {
  const content = question.content as { imageUrl: string; transcript: string[] }
  const letters = ['A', 'B', 'C', 'D']
  const [playing, setPlaying] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function playStatement(letter: string, text: string) {
    setPlaying(letter)
    playTTS(text, () => setPlaying(null))
  }

  function playAll() {
    let i = 0
    const playNext = () => {
      if (i >= content.transcript.length) { setPlaying(null); return }
      const letter = letters[i]
      setPlaying(letter)
      const fullText = `${letter}. ${content.transcript[i]}`
      i++
      playTTS(fullText, playNext)
    }
    playNext()
  }

  function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    onAnswer(selected, selected === question.answer)
  }

  return (
    <div className="card" style={{ padding: '24px 24px 20px' }}>
      {/* Image */}
      <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', maxHeight: 300 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.imageUrl} alt="TOEIC Listening Part 1" style={{ width: '100%', objectFit: 'cover', maxHeight: 300 }} />
      </div>

      {/* Play all */}
      <button
        onClick={playAll}
        disabled={!!playing}
        className="flex items-center gap-2 text-sm font-medium mb-4 px-4 py-2 rounded-lg"
        style={{ background: 'var(--accent)', color: '#fff', opacity: playing ? 0.7 : 1 }}
      >
        {playing ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        Alle Aussagen abspielen
      </button>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {content.transcript.map((text, i) => {
          const letter = letters[i]
          const isSelected = selected === letter
          const isCorrect = submitted && letter === question.answer
          const isWrong = submitted && isSelected && !isCorrect

          let borderColor = 'var(--card-border)'
          let bg = 'transparent'
          let textColor = 'var(--foreground)'
          if (!submitted && isSelected) { borderColor = 'var(--accent)'; bg = 'var(--accent-subtle)' }
          if (isCorrect) { borderColor = 'var(--success)'; bg = 'rgba(74,222,128,0.1)'; textColor = 'var(--success)' }
          if (isWrong) { borderColor = 'var(--error)'; bg = 'rgba(248,113,113,0.1)'; textColor = 'var(--error)' }

          return (
            <div key={letter} className="flex items-center gap-3">
              <button
                disabled={submitted}
                onClick={() => setSelected(letter)}
                className="flex-1 flex items-center gap-3 p-3 rounded-lg text-left transition-all border"
                style={{ borderColor, background: bg, color: textColor }}
              >
                <span className="w-7 h-7 rounded shrink-0 flex items-center justify-center text-sm font-semibold"
                  style={{ background: 'var(--card-border)', color: textColor }}>
                  {letter}
                </span>
                <span className="text-sm">{text}</span>
              </button>
              <button
                onClick={() => playStatement(letter, text)}
                disabled={!!playing}
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: playing === letter ? 'var(--accent-subtle)' : 'var(--surface)', color: 'var(--accent)' }}
                title={`Aussage ${letter} abspielen`}
              >
                {playing === letter ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
              </button>
            </div>
          )
        })}
      </div>

      {submitted && question.explanation && (
        <div className="rounded-lg text-sm mb-4"
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '12px 14px' }}>
          <span className="font-medium" style={{ color: 'var(--accent)' }}>Erklärung: </span>
          {question.explanation}
        </div>
      )}

      <div className="flex justify-end">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary">Antwort prüfen</button>
        ) : null}
      </div>
    </div>
  )
}

// ── Part 2: Question-Response ─────────────────────────────────────────────────
function Part2Card({
  question, onAnswer,
}: {
  question: Question
  onAnswer: (letter: string, correct: boolean) => void
}) {
  const content = question.content as { question: string; responses: string[] }
  const letters = ['A', 'B', 'C']
  const [playing, setPlaying] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [questionPlayed, setQuestionPlayed] = useState(false)

  function playQuestion() {
    setPlaying('Q')
    playTTS(content.question, () => {
      setPlaying(null)
      setQuestionPlayed(true)
    })
  }

  function playResponse(letter: string, text: string) {
    setPlaying(letter)
    playTTS(text, () => setPlaying(null))
  }

  function playAll() {
    setPlaying('Q')
    playTTS(content.question, () => {
      let i = 0
      const playNext = () => {
        if (i >= content.responses.length) { setPlaying(null); setQuestionPlayed(true); return }
        const letter = letters[i]
        setPlaying(letter)
        playTTS(`${letter}. ${content.responses[i]}`, playNext)
        i++
      }
      playNext()
    })
  }

  function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
    onAnswer(selected, selected === question.answer)
  }

  return (
    <div className="card" style={{ padding: '24px 24px 20px' }}>
      {/* Question audio */}
      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Frage (Ton)</p>
        <div className="flex items-center gap-3">
          <button
            onClick={playQuestion}
            disabled={!!playing}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg"
            style={{ background: 'var(--accent)', color: '#fff', opacity: playing ? 0.7 : 1 }}
          >
            {playing === 'Q' ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
            Frage abspielen
          </button>
          <button
            onClick={playAll}
            disabled={!!playing}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--card-border)', opacity: playing ? 0.7 : 1 }}
          >
            <Play size={14} /> Alle abspielen
          </button>
        </div>
        {questionPlayed && (
          <p className="text-sm mt-2 italic" style={{ color: 'var(--muted)' }}>{content.question}</p>
        )}
      </div>

      {/* Responses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {content.responses.map((text, i) => {
          const letter = letters[i]
          const isSelected = selected === letter
          const isCorrect = submitted && letter === question.answer
          const isWrong = submitted && isSelected && !isCorrect

          let borderColor = 'var(--card-border)'
          let bg = 'transparent'
          let textColor = 'var(--foreground)'
          if (!submitted && isSelected) { borderColor = 'var(--accent)'; bg = 'var(--accent-subtle)' }
          if (isCorrect) { borderColor = 'var(--success)'; bg = 'rgba(74,222,128,0.1)'; textColor = 'var(--success)' }
          if (isWrong) { borderColor = 'var(--error)'; bg = 'rgba(248,113,113,0.1)'; textColor = 'var(--error)' }

          return (
            <div key={letter} className="flex items-center gap-3">
              <button
                disabled={submitted}
                onClick={() => setSelected(letter)}
                className="flex-1 flex items-center gap-3 p-3 rounded-lg text-left transition-all border"
                style={{ borderColor, background: bg, color: textColor }}
              >
                <span className="w-7 h-7 rounded shrink-0 flex items-center justify-center text-sm font-semibold"
                  style={{ background: 'var(--card-border)', color: textColor }}>
                  {letter}
                </span>
                <span className="text-sm">{text}</span>
              </button>
              <button
                onClick={() => playResponse(letter, text)}
                disabled={!!playing}
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: playing === letter ? 'var(--accent-subtle)' : 'var(--surface)', color: 'var(--accent)' }}
                title={`Antwort ${letter} abspielen`}
              >
                {playing === letter ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
              </button>
            </div>
          )
        })}
      </div>

      {submitted && question.explanation && (
        <div className="rounded-lg text-sm mb-4"
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '12px 14px' }}>
          <span className="font-medium" style={{ color: 'var(--accent)' }}>Erklärung: </span>
          {question.explanation}
        </div>
      )}

      <div className="flex justify-end">
        {!submitted && (
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary">Antwort prüfen</button>
        )}
      </div>
    </div>
  )
}

// ── Part 3/4: Group Card (transcript + multiple questions) ────────────────────
function GroupCard({
  group, partLabel, onGroupDone,
}: {
  group: QuestionGroup
  partLabel: string
  onGroupDone: (results: { questionId: string; letter: string; correct: boolean }[]) => void
}) {
  const [played, setPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<{ letter: string; correct: boolean }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function playTranscript() {
    setPlaying(true)
    playTTS(group.transcript, () => {
      setPlaying(false)
      setPlayed(true)
    })
  }

  function handleSubmit() {
    if (!selected) return
    const q = group.questions[qIndex]
    const correct = selected === q.answer
    setSubmitted(true)
    const newAnswers = [...answers, { letter: selected, correct }]
    if (qIndex + 1 >= group.questions.length) {
      setTimeout(() => {
        onGroupDone(group.questions.map((q2, i) => ({
          questionId: q2.id,
          letter: newAnswers[i]?.letter ?? '',
          correct: newAnswers[i]?.correct ?? false,
        })))
      }, 1200)
    } else {
      setAnswers(newAnswers)
      setTimeout(() => {
        setQIndex(i => i + 1)
        setSelected(null)
        setSubmitted(false)
      }, 1200)
    }
  }

  const question = group.questions[qIndex]
  const content = question.content as { transcript: string; question: string; graphic?: { type: string; title: string; headers: string[]; rows: string[][] } }
  const opts = question.options as string[]
  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="card" style={{ padding: '24px 24px 20px' }}>
      {/* Transcript audio */}
      <div className="rounded-lg p-4 mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
          {partLabel === 'Part 3' ? 'Gespräch (Ton)' : 'Monolog (Ton)'}
        </p>
        <button
          onClick={playTranscript}
          disabled={playing}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg"
          style={{ background: 'var(--accent)', color: '#fff', opacity: playing ? 0.7 : 1 }}
        >
          {playing ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
          {playing ? 'Wird abgespielt…' : played ? 'Nochmals abspielen' : 'Ton abspielen'}
        </button>
        {played && (
          <p className="text-xs mt-3 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
            {group.transcript}
          </p>
        )}
      </div>

      {/* Graphic (if any) */}
      {content.graphic && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--card-border)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>{content.graphic.title}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {content.graphic.headers.map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--card-border)', color: 'var(--muted)', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.graphic.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '4px 8px', fontSize: 12 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Question */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--card-border)', color: 'var(--muted)' }}>
          Frage {qIndex + 1}/{group.questions.length}
        </span>
      </div>
      <p className="text-base font-medium mb-4">{content.question}</p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {opts.map((opt, i) => {
          const letter = letters[i]
          const isSelected = selected === letter
          const isCorrect = submitted && letter === question.answer
          const isWrong = submitted && isSelected && !isCorrect

          let borderColor = 'var(--card-border)'
          let bg = 'transparent'
          let textColor = 'var(--foreground)'
          if (!submitted && isSelected) { borderColor = 'var(--accent)'; bg = 'var(--accent-subtle)' }
          if (isCorrect) { borderColor = 'var(--success)'; bg = 'rgba(74,222,128,0.1)'; textColor = 'var(--success)' }
          if (isWrong) { borderColor = 'var(--error)'; bg = 'rgba(248,113,113,0.1)'; textColor = 'var(--error)' }

          return (
            <button
              key={letter}
              disabled={submitted}
              onClick={() => setSelected(letter)}
              className="flex items-center gap-3 p-3 rounded-lg text-left transition-all border"
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
        <div className="rounded-lg text-sm mb-4"
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '12px 14px' }}>
          <span className="font-medium" style={{ color: 'var(--accent)' }}>Erklärung: </span>
          {question.explanation}
        </div>
      )}

      <div className="flex justify-end">
        {!submitted && (
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary">Antwort prüfen</button>
        )}
        {submitted && (
          <span className="text-sm font-medium flex items-center gap-2"
            style={{ color: answers[qIndex]?.correct || (selected === question.answer) ? 'var(--success)' : 'var(--error)' }}>
            {selected === question.answer
              ? <><CheckCircle size={16} /> Richtig</>
              : <><XCircle size={16} /> Richtig wäre: {question.answer}</>}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main ListeningShell ───────────────────────────────────────────────────────
export default function ListeningShell({ part }: ListeningShellProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [groups, setGroups] = useState<QuestionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [groupIndex, setGroupIndex] = useState(0)
  const [singleIndex, setSingleIndex] = useState(0)
  const [results, setResults] = useState<{ questionId: string; letter: string; correct: boolean }[]>([])
  const [finished, setFinished] = useState(false)
  const sessionIdRef = useRef<string | null>(null)

  const partTitles: Record<number, string> = {
    1: 'Part 1 – Fotografien',
    2: 'Part 2 – Frage & Antwort',
    3: 'Part 3 – Gespräche',
    4: 'Part 4 – Monologe',
  }

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setResults([])
    setGroupIndex(0)
    setSingleIndex(0)
    setFinished(false)
    const res = await fetch(`/api/questions?section=LISTENING&part=${part}`)
    const data = await res.json()
    const qs: Question[] = data.questions ?? []
    setQuestions(qs)

    if (part === 3 || part === 4) {
      setGroups(groupByTranscript(qs))
    }

    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'PART_PRACTICE', parts: [part], totalQuestions: qs.length }),
    })
    const sessionData = await sessionRes.json()
    sessionIdRef.current = sessionData.id
    setLoading(false)
  }, [part])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // Stop audio on unmount
  useEffect(() => () => { cancelTTS() }, [])

  function handleSingleAnswer(letter: string, correct: boolean) {
    const q = questions[singleIndex]
    const newResults = [...results, { questionId: q.id, letter, correct }]
    setResults(newResults)
    setTimeout(() => {
      if (singleIndex + 1 >= questions.length) {
        finalize(newResults)
      } else {
        setSingleIndex(i => i + 1)
      }
    }, 1000)
  }

  function handleGroupDone(groupResults: { questionId: string; letter: string; correct: boolean }[]) {
    const newResults = [...results, ...groupResults]
    setResults(newResults)
    if (groupIndex + 1 >= groups.length) {
      finalize(newResults)
    } else {
      setGroupIndex(i => i + 1)
    }
  }

  function finalize(finalResults: { questionId: string; letter: string; correct: boolean }[]) {
    setFinished(true)
    const score = finalResults.filter(r => r.correct).length
    if (sessionIdRef.current) {
      fetch(`/api/sessions/${sessionIdRef.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          maxScore: finalResults.length,
          durationSec: 0,
          answers: finalResults.map(r => ({
            questionId: r.questionId,
            userAnswer: r.letter,
            isCorrect: r.correct,
            timeSpentSec: 0,
          })),
        }),
      })
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-2">{partTitles[part]}</h1>
        <div className="card" style={{ padding: 48, marginTop: 24, textAlign: 'center', color: 'var(--muted)' }}>
          Fragen werden geladen…
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-4">{partTitles[part]}</h1>
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Keine Fragen für diesen Teil gefunden.
        </div>
      </div>
    )
  }

  if (finished) {
    const score = results.filter(r => r.correct).length
    const pct = Math.round(score / results.length * 100)
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold mb-6">{partTitles[part]} — Ergebnis</h1>
        <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
          <div className="text-6xl font-bold mb-2"
            style={{ color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)' }}>
            {pct}%
          </div>
          <p className="text-lg mb-1">{score} von {results.length} richtig</p>
          <p style={{ color: 'var(--muted)' }}>
            {pct >= 80 ? 'Ausgezeichnet!' : pct >= 60 ? 'Gut gemacht!' : 'Weiter üben!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadQuestions} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> Nochmals üben
          </button>
          <button onClick={() => router.push('/listening')}
            className="text-sm font-medium rounded-lg border"
            style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>
            Zurück zu Listening
          </button>
        </div>
      </div>
    )
  }

  const totalQ = questions.length
  const doneQ = part === 3 || part === 4 ? results.length : singleIndex

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="text-2xl font-bold mb-1">{partTitles[part]}</h1>
          <p className="text-sm flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <Volume2 size={13} /> KI-Audio aktiviert
          </p>
        </div>
        <div className="text-sm font-medium rounded-full"
          style={{ padding: '4px 14px', background: 'var(--card-border)', whiteSpace: 'nowrap' }}>
          {doneQ + 1} / {totalQ}
        </div>
      </div>

      <div className="rounded-full overflow-hidden" style={{ height: 6, marginBottom: 24, background: 'var(--card-border)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(doneQ / totalQ) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {(part === 1) && questions[singleIndex] && (
        <Part1Card
          key={(questions[singleIndex] as Question).id}
          question={questions[singleIndex] as Question}
          onAnswer={(letter, correct) => handleSingleAnswer(letter, correct)}
        />
      )}
      {(part === 2) && questions[singleIndex] && (
        <Part2Card
          key={(questions[singleIndex] as Question).id}
          question={questions[singleIndex] as Question}
          onAnswer={(letter, correct) => handleSingleAnswer(letter, correct)}
        />
      )}
      {(part === 3 || part === 4) && groups[groupIndex] && (
        <GroupCard
          key={groupIndex}
          group={groups[groupIndex] as QuestionGroup}
          partLabel={part === 3 ? 'Part 3' : 'Part 4'}
          onGroupDone={handleGroupDone}
        />
      )}
    </div>
  )
}