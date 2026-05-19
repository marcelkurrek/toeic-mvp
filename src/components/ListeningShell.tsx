'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useExamStore } from '@/store/exam'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Play, Square, Loader2 } from 'lucide-react'

const PART_INFO = {
  1: { title: 'Part 1 — Photographs', desc: 'Listen to four statements and choose the one that best describes the picture.' },
  2: { title: 'Part 2 — Question-Response', desc: 'Listen to a question and three responses, then choose the best reply.' },
  3: { title: 'Part 3 — Conversations', desc: 'Listen to a conversation, then answer the questions.' },
  4: { title: 'Part 4 — Talks', desc: 'Listen to a short talk, then answer the questions.' },
} as const

interface ListeningShellProps {
  part: 1 | 2 | 3 | 4
  nextParts?: string
}

const audioCache = new Map<string, string>()

async function fetchAudio(text: string): Promise<string> {
  if (audioCache.has(text)) return audioCache.get(text)!
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('TTS failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  audioCache.set(text, url)
  return url
}

function useAudioPlayer() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(async (key: string, text: string) => {
    if (loading) return
    if (playing === key) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(null)
    }
    setLoading(key)
    try {
      const url = await fetchAudio(text)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPlaying(null)
      audio.onerror = () => setPlaying(null)
      await audio.play()
      setPlaying(key)
    } catch {
      setPlaying(null)
    } finally {
      setLoading(null)
    }
  }, [loading, playing])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(null)
  }, [])

  return { play, stop, playing, loading }
}

export default function ListeningShell({ part, nextParts }: ListeningShellProps) {
  const router = useRouter()
  const { questions, currentIndex, answers, isFinished, setQuestions, submitAnswer, nextQuestion, reset } = useExamStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { play, stop, playing, loading: audioLoading } = useAudioPlayer()

  const partInfo = PART_INFO[part]

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    reset()
    const res = await fetch(`/api/questions?part=${part}`)
    const data = await res.json()
    setQuestions(data.questions)

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
    stop()
  }, [currentIndex, stop])

  useEffect(() => {
    if (!isFinished || !sessionId || saving) return
    setSaving(true)
    const score = answers.filter(a => a.isCorrect).length
    const durationSec = Math.round(answers.reduce((s, a) => s + a.timeSpentSec, 0))
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
    stop()
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 8 }}>{partInfo.title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>{partInfo.desc}</p>
        <div className="card" style={{ padding: 48, marginTop: 24, textAlign: 'center', color: 'var(--muted)' }}>
          Loading questions…
        </div>
      </div>
    )
  }

  if (isFinished) {
    const score = answers.filter(a => a.isCorrect).length
    const pct = Math.round(score / questions.length * 100)
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 28 }}>{partInfo.title} — Results</h1>
        <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
          <div className="text-6xl font-bold mb-2" style={{
            color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)'
          }}>
            {pct}%
          </div>
          <p className="text-lg mb-1">{score} / {questions.length} correct</p>
          <p style={{ color: 'var(--muted)' }}>
            {pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort, keep practicing!' : 'Keep going, practice makes perfect!'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {questions.map((q, i) => {
            const ans = answers[i]
            if (!ans) return null
            const content = q.content as unknown as Part1Content & Part2Content & Part34Content
            const letters = ['A', 'B', 'C', 'D']
            const opts = Array.isArray(q.options) ? q.options as string[] : []
            return (
              <div key={q.id} className="card" style={{ padding: '20px 24px' }}>
                <div className="flex items-start gap-3" style={{ marginBottom: 10 }}>
                  {ans.isCorrect
                    ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    : <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />}
                  <div style={{ flex: 1 }}>
                    {part === 1 && (
                      <ResultPart1
                        content={content as unknown as Part1Content}
                        answer={q.answer}
                        userAnswer={ans.userAnswer}
                        letters={letters}
                      />
                    )}
                    {part === 2 && (
                      <ResultPart2
                        content={content as unknown as Part2Content}
                        answer={q.answer}
                        userAnswer={ans.userAnswer}
                        letters={letters}
                      />
                    )}
                    {(part === 3 || part === 4) && (
                      <ResultPart34
                        content={content as unknown as Part34Content}
                        opts={opts}
                        answer={q.answer}
                        userAnswer={ans.userAnswer}
                        letters={letters}
                      />
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-xs p-3 rounded-lg" style={{ background: 'var(--accent-subtle)', color: 'var(--foreground)' }}>
                        <span className="font-medium" style={{ color: 'var(--accent)' }}>Explanation: </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadQuestions} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> Practice Again
          </button>
          <button onClick={() => router.push('/progress')}
            className="text-sm font-medium rounded-lg border"
            style={{ padding: '0 20px', borderColor: 'var(--card-border)', height: 44 }}>
            View Progress
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  if (!question) return null

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>{partInfo.title}</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{partInfo.desc}</p>
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

      {part === 1 && (
        <Part1Card
          question={question}
          selected={selected}
          submitted={submitted}
          onSelect={setSelected}
          onSubmit={handleSubmit}
          onNext={nextQuestion}
          isLast={currentIndex === questions.length - 1}
          play={play}
          playing={playing}
          audioLoading={audioLoading}
          answers={answers}
          currentIndex={currentIndex}
        />
      )}
      {part === 2 && (
        <Part2Card
          question={question}
          selected={selected}
          submitted={submitted}
          onSelect={setSelected}
          onSubmit={handleSubmit}
          onNext={nextQuestion}
          isLast={currentIndex === questions.length - 1}
          play={play}
          playing={playing}
          audioLoading={audioLoading}
          answers={answers}
          currentIndex={currentIndex}
        />
      )}
      {(part === 3 || part === 4) && (
        <Part34Card
          question={question}
          selected={selected}
          submitted={submitted}
          onSelect={setSelected}
          onSubmit={handleSubmit}
          onNext={nextQuestion}
          isLast={currentIndex === questions.length - 1}
          play={play}
          playing={playing}
          audioLoading={audioLoading}
          answers={answers}
          currentIndex={currentIndex}
        />
      )}
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Part1Content { imageUrl: string; transcript: string[] }
interface Part2Content { question: string; responses: string[] }
interface Part34Content { transcript: string; question: string }

interface CardSharedProps {
  question: Question
  selected: string | null
  submitted: boolean
  onSelect: (l: string) => void
  onSubmit: () => void
  onNext: () => void
  isLast: boolean
  play: (key: string, text: string) => void
  playing: string | null
  audioLoading: string | null
  answers: { isCorrect: boolean }[]
  currentIndex: number
}

// ── AudioButton ────────────────────────────────────────────────────────────

function AudioButton({ id, text, label, play, playing, audioLoading }: {
  id: string; text: string; label?: string
  play: (key: string, text: string) => void
  playing: string | null; audioLoading: string | null
}) {
  const isPlaying = playing === id
  const isLoading = audioLoading === id
  return (
    <button
      onClick={() => play(id, text)}
      disabled={!!(audioLoading && audioLoading !== id)}
      className="flex items-center gap-2 rounded-lg border text-sm font-medium transition-all"
      style={{
        padding: '8px 14px',
        borderColor: isPlaying ? 'var(--accent)' : 'var(--card-border)',
        background: isPlaying ? 'var(--accent-subtle)' : 'transparent',
        color: isPlaying ? 'var(--accent)' : 'var(--foreground)',
      }}
    >
      {isLoading ? <Loader2 size={15} className="animate-spin" /> : isPlaying ? <Square size={15} /> : <Play size={15} />}
      {label && <span>{label}</span>}
    </button>
  )
}

// ── Part 1 Card ────────────────────────────────────────────────────────────

function Part1Card({ question, selected, submitted, onSelect, onSubmit, onNext, isLast, play, playing, audioLoading, answers, currentIndex }: CardSharedProps) {
  const content = question.content as unknown as Part1Content
  const letters = ['A', 'B', 'C', 'D']
  const correctLetter = question.answer
  const currentAnswer = answers[currentIndex]

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt="Question photograph"
          className="w-full rounded-lg object-cover"
          style={{ maxHeight: 320, marginBottom: 24 }}
        />
      )}

      <p className="text-sm font-medium" style={{ color: 'var(--muted)', marginBottom: 14 }}>
        Listen to each statement and choose the one that best describes the picture.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {letters.map((letter, i) => {
          const stmt = content.transcript?.[i] ?? ''
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
            <div key={letter} className="flex items-center gap-3 rounded-lg border transition-all"
              style={{ borderColor, background: bg, padding: '10px 14px' }}>
              <AudioButton id={`q${question.id}-${letter}`} text={stmt} play={play} playing={playing} audioLoading={audioLoading} />
              <button
                disabled={submitted}
                onClick={() => onSelect(letter)}
                className="flex items-center gap-2 flex-1 text-left text-sm font-medium"
                style={{ color: textColor, background: 'none', border: 'none', cursor: submitted ? 'default' : 'pointer' }}
              >
                <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: 'var(--card-border)' }}>
                  {letter}
                </span>
                {submitted ? <span>{stmt}</span> : <span style={{ color: 'var(--muted)' }}>Statement {letter}</span>}
              </button>
            </div>
          )
        })}
      </div>

      <QuestionFooter
        submitted={submitted}
        selected={selected}
        isLast={isLast}
        isCorrect={currentAnswer?.isCorrect}
        correctLetter={correctLetter}
        explanation={question.explanation ?? undefined}
        onSubmit={onSubmit}
        onNext={onNext}
      />
    </div>
  )
}

// ── Part 2 Card ────────────────────────────────────────────────────────────

function Part2Card({ question, selected, submitted, onSelect, onSubmit, onNext, isLast, play, playing, audioLoading, answers, currentIndex }: CardSharedProps) {
  const content = question.content as unknown as Part2Content
  const letters = ['A', 'B', 'C']
  const correctLetter = question.answer
  const currentAnswer = answers[currentIndex]

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div className="flex items-center gap-3 rounded-lg"
        style={{ background: 'var(--background)', border: '1px solid var(--card-border)', padding: '14px 18px', marginBottom: 24 }}>
        <AudioButton id={`q${question.id}-question`} text={content.question ?? ''} play={play} playing={playing} audioLoading={audioLoading} />
        <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          {submitted ? content.question : 'Play the question'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {letters.map((letter, i) => {
          const response = content.responses?.[i] ?? ''
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
            <div key={letter} className="flex items-center gap-3 rounded-lg border transition-all"
              style={{ borderColor, background: bg, padding: '10px 14px' }}>
              <AudioButton id={`q${question.id}-${letter}`} text={response} play={play} playing={playing} audioLoading={audioLoading} />
              <button
                disabled={submitted}
                onClick={() => onSelect(letter)}
                className="flex items-center gap-2 flex-1 text-left text-sm font-medium"
                style={{ color: textColor, background: 'none', border: 'none', cursor: submitted ? 'default' : 'pointer' }}
              >
                <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: 'var(--card-border)' }}>
                  {letter}
                </span>
                {submitted ? <span>{response}</span> : <span style={{ color: 'var(--muted)' }}>Response {letter}</span>}
              </button>
            </div>
          )
        })}
      </div>

      <QuestionFooter
        submitted={submitted}
        selected={selected}
        isLast={isLast}
        isCorrect={currentAnswer?.isCorrect}
        correctLetter={correctLetter}
        explanation={question.explanation ?? undefined}
        onSubmit={onSubmit}
        onNext={onNext}
      />
    </div>
  )
}

// ── Part 3/4 Card ──────────────────────────────────────────────────────────

function Part34Card({ question, selected, submitted, onSelect, onSubmit, onNext, isLast, play, playing, audioLoading, answers, currentIndex }: CardSharedProps) {
  const content = question.content as unknown as Part34Content
  const opts = Array.isArray(question.options) ? question.options as string[] : []
  const letters = ['A', 'B', 'C', 'D']
  const correctLetter = question.answer
  const currentAnswer = answers[currentIndex]

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      <div className="flex items-center gap-3 rounded-lg"
        style={{ background: 'var(--background)', border: '1px solid var(--card-border)', padding: '14px 18px', marginBottom: 22 }}>
        <AudioButton id={`q${question.id}-transcript`} text={content.transcript ?? ''} play={play} playing={playing} audioLoading={audioLoading} />
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)', marginBottom: 2 }}>TRANSCRIPT</p>
          {submitted
            ? <p className="text-sm" style={{ color: 'var(--foreground)' }}>{content.transcript}</p>
            : <p className="text-sm" style={{ color: 'var(--muted)' }}>Play to listen</p>}
        </div>
      </div>

      <p className="text-base font-medium leading-relaxed" style={{ marginBottom: 20 }}>{content.question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {opts.map((opt, i) => {
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

      <QuestionFooter
        submitted={submitted}
        selected={selected}
        isLast={isLast}
        isCorrect={currentAnswer?.isCorrect}
        correctLetter={correctLetter}
        explanation={question.explanation ?? undefined}
        onSubmit={onSubmit}
        onNext={onNext}
      />
    </div>
  )
}

// ── Shared Footer ──────────────────────────────────────────────────────────

function QuestionFooter({ submitted, selected, isLast, isCorrect, correctLetter, explanation, onSubmit, onNext }: {
  submitted: boolean; selected: string | null; isLast: boolean
  isCorrect: boolean | undefined; correctLetter: string; explanation?: string
  onSubmit: () => void; onNext: () => void
}) {
  return (
    <>
      {submitted && explanation && (
        <div className="rounded-lg text-sm"
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '14px 16px', marginBottom: 20 }}>
          <p className="font-medium" style={{ color: 'var(--accent)', marginBottom: 6 }}>Explanation</p>
          <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{explanation}</p>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {submitted && (
            <span className="text-sm font-medium flex items-center gap-2"
              style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
              {isCorrect
                ? <><CheckCircle size={16} /> Correct!</>
                : <><XCircle size={16} /> Incorrect — answer: {correctLetter}</>}
            </span>
          )}
        </div>
        {!submitted ? (
          <button onClick={onSubmit} disabled={!selected} className="btn-primary">
            Submit Answer
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary flex items-center gap-2">
            {isLast ? 'See Results' : 'Next'} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </>
  )
}

// ── Result helpers ─────────────────────────────────────────────────────────

function ResultPart1({ content, answer, userAnswer, letters }: {
  content: Part1Content; answer: string; userAnswer: string; letters: string[]
}) {
  return (
    <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {letters.map((letter, i) => {
        const isCorrect = answer === letter
        const isUser = userAnswer === letter
        return (
          <div key={letter} className="flex items-start gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-medium shrink-0"
              style={{
                background: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--card-border)',
                color: isCorrect || (isUser && !isCorrect) ? '#fff' : 'var(--muted)',
              }}>
              {letter}
            </span>
            <span style={{ color: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--muted)' }}>
              {content.transcript?.[i] ?? ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ResultPart2({ content, answer, userAnswer, letters }: {
  content: Part2Content; answer: string; userAnswer: string; letters: string[]
}) {
  return (
    <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p className="font-medium" style={{ marginBottom: 6 }}>{content.question}</p>
      {letters.map((letter, i) => {
        const isCorrect = answer === letter
        const isUser = userAnswer === letter
        return (
          <div key={letter} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-medium shrink-0"
              style={{
                background: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--card-border)',
                color: isCorrect || (isUser && !isCorrect) ? '#fff' : 'var(--muted)',
              }}>
              {letter}
            </span>
            <span style={{ color: isCorrect ? 'var(--success)' : isUser && !isCorrect ? 'var(--error)' : 'var(--muted)' }}>
              {content.responses?.[i] ?? ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ResultPart34({ content, opts, answer, userAnswer, letters }: {
  content: Part34Content; opts: string[]; answer: string; userAnswer: string; letters: string[]
}) {
  return (
    <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p className="font-medium" style={{ marginBottom: 6 }}>{content.question}</p>
      {opts.map((opt, i) => {
        const letter = letters[i]
        const isCorrect = answer === letter
        const isUser = userAnswer === letter
        return (
          <div key={letter} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-medium shrink-0"
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
    </div>
  )
}