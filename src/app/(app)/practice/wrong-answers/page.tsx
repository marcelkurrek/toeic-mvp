import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Section } from '@prisma/client'

const PART_HREFS: Record<string, Record<number, string>> = {
  LISTENING: { 1: '/practice/part1', 2: '/practice/part2', 3: '/practice/part3', 4: '/practice/part4' },
  READING:   { 5: '/practice/part5', 6: '/practice/part6', 7: '/practice/part7' },
}

function sectionBadgeStyle(section: string) {
  return section === 'LISTENING'
    ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' }
    : { background: 'rgba(234,179,8,0.12)', color: '#a16207', border: '1px solid rgba(234,179,8,0.3)' }
}

function getQuestionText(content: unknown): string {
  if (!content || typeof content !== 'object') return '—'
  const c = content as Record<string, unknown>
  return (c.question as string) ?? (c.text as string) ?? (c.stem as string) ?? '—'
}

function getOptions(options: unknown): Record<string, string> | null {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return null
  return options as Record<string, string>
}

type WrongAnswer = {
  id: string
  userAnswer: string
  createdAt: Date
  question: {
    id: string
    section: Section
    part: number
    content: unknown
    options: unknown
    answer: string
    explanation: string | null
    type: string
  }
}

type Group = {
  label: string
  section: string
  part: number
  items: WrongAnswer[]
}

export default async function WrongAnswersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })

  const wrongAnswers: WrongAnswer[] = dbUser ? await prisma.answer.findMany({
    where: { session: { userId: dbUser.id }, isCorrect: false },
    include: {
      question: {
        select: { id: true, section: true, part: true, content: true, options: true, answer: true, explanation: true, type: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  }) : []

  const groupMap = new Map<string, Group>()
  for (const a of wrongAnswers) {
    const key = `${a.question.section}_${a.question.part}`
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label: `${a.question.section === 'LISTENING' ? 'LISTENING' : 'READING'} · Part ${a.question.part}`,
        section: a.question.section,
        part: a.question.part,
        items: [],
      })
    }
    groupMap.get(key)!.items.push(a)
  }
  const groups = Array.from(groupMap.values())

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Meine Fehler</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          {wrongAnswers.length === 0 ? '' : `${wrongAnswers.length} falsch beantwortet${wrongAnswers.length === 100 ? ' (letzte 100)' : ''}`}
        </p>
      </div>

      {wrongAnswers.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 14,
          padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Keine Fehler bisher!</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Weiter so — du machst alles richtig.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {groups.map(group => (
            <div key={`${group.section}_${group.part}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{
                  ...sectionBadgeStyle(group.section),
                  fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                  letterSpacing: '0.04em',
                }}>
                  {group.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{group.items.length} Fehler</span>
                {PART_HREFS[group.section]?.[group.part] && (
                  <Link href={PART_HREFS[group.section][group.part]} style={{
                    marginLeft: 'auto', fontSize: 12, color: 'var(--accent)',
                    textDecoration: 'none', fontWeight: 500,
                  }}>
                    Nochmal üben →
                  </Link>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {group.items.map(a => {
                  const opts = getOptions(a.question.options)
                  const qText = getQuestionText(a.question.content)
                  return (
                    <div key={a.id} style={{
                      background: 'var(--card)', border: '1px solid var(--card-border)',
                      borderRadius: 12, padding: '16px 18px',
                    }}>
                      {qText !== '—' && (
                        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 12px', lineHeight: 1.5 }}>
                          {qText}
                        </p>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', flexShrink: 0, marginTop: 2 }}>✗ Deine Antwort</span>
                          <span style={{
                            fontSize: 13, background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                            padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)',
                          }}>
                            {opts ? `(${a.userAnswer}) ${opts[a.userAnswer] ?? a.userAnswer}` : a.userAnswer}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', flexShrink: 0, marginTop: 2 }}>✓ Richtig</span>
                          <span style={{
                            fontSize: 13, background: 'rgba(34,197,94,0.08)', color: '#16a34a',
                            padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.2)',
                          }}>
                            {opts ? `(${a.question.answer}) ${opts[a.question.answer] ?? a.question.answer}` : a.question.answer}
                          </span>
                        </div>
                      </div>

                      {a.question.explanation && (
                        <div style={{
                          marginTop: 12, padding: '10px 12px',
                          background: 'var(--surface, rgba(255,255,255,0.04))',
                          borderRadius: 8, border: '1px solid var(--card-border)',
                          fontSize: 12, color: 'var(--muted)', lineHeight: 1.6,
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--foreground)', marginRight: 4 }}>Erklärung:</span>
                          {a.question.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
