'use client'
import { useEffect, useState, useCallback } from 'react'
import { useExamStore } from '@/store/exam'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types'
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'

interface PracticeShellProps {
  part: 5 | 6 | 7
}

export default function PracticeShell({ part }: PracticeShellProps) {
  const router = useRouter()
  const { t } = useLang()
  const { questions, currentIndex, answers, isFinished, setQuestions, submitAnswer, nextQuestion, reset } = useExamStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const partInfo = t.practice.parts[part]

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
    return (
      <div style={{ maxWidth: 768, margin: '0 auto' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 28 }}>{partInfo.title} — {t.practice.results}</h1>
        <div className="card" style={{ padding: '36px 32px', marginBottom: 24, textAlign: 'center' }}>
          <div className="text-6xl font-bold mb-2" style={{
            color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)'
          }}>
            {pct}%
          </div>
          <p className="text-lg mb-1">
            {t.practice.score.replace('{score}', String(score)).replace('{max}', String(questions.length))}
          </p>
          <p style={{ color: 'var(--muted)' }}>
            {pct >= 80 ? t.practice.feedback.excellent : pct >= 60 ? t.practice.feedback.good : t.practice.feedback.keep}
          </p>
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
        isLast={currentIndex === questions.length - 1}
        t={t.practice}
      />
    </div>
  )
}

function QuestionCard({ question, opts, letters, selected, submitted, correctLetter, currentAnswer, onSelect, onSubmit, onNext, isLast, t }: {
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
  isLast: boolean
  t: { passage: string; explanation: string; correct: string; incorrect: string; submitBtn: string; nextBtn: string; resultsBtn: string }
}) {
  const content = question.content as { question: string; passage?: string }

  return (
    <div className="card" style={{ padding: '28px 28px 24px' }}>
      {content.passage && (
        <div className="rounded-lg text-sm leading-relaxed"
          style={{ background: 'var(--background)', borderLeft: '3px solid var(--accent)', color: 'var(--foreground)', padding: '16px 18px', marginBottom: 22 }}>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)', marginBottom: 8 }}>{t.passage}</p>
          <p className="whitespace-pre-wrap">{content.passage}</p>
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
          style={{ background: 'var(--accent-subtle)', borderLeft: '3px solid var(--accent)', padding: '14px 16px', marginBottom: 20 }}>
          <p className="font-medium" style={{ color: 'var(--accent)', marginBottom: 6 }}>{t.explanation}</p>
          <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{question.explanation}</p>
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
  )
}
