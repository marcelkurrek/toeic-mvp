import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getServerTranslations } from '@/lib/i18n/server'

export default async function ProgressPage() {
  const t = await getServerTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      progress: { orderBy: { part: 'asc' } },
      sessions: {
        where: { completedAt: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { answers: { include: { question: { select: { part: true } } } } },
      },
    },
  })

  const progress = dbUser?.progress ?? []
  const sessions = dbUser?.sessions ?? []

  const PART_META = ([5, 6, 7] as const).map(part => ({
    part,
    label: t.progress.parts[part].label,
    desc:  t.progress.parts[part].desc,
    color: part === 5 ? '#22d3ee' : part === 6 ? '#4ade80' : '#fb923c',
    subtle: part === 5 ? 'rgba(34,211,238,0.12)' : part === 6 ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.12)',
  }))

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>

      <div style={{ marginBottom: 36 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 8 }}>{t.progress.heading}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>{t.progress.subheading}</p>
      </div>

      {/* Listening parts 1–4 */}
      <h2 className="text-lg font-semibold" style={{ marginBottom: 16 }}>Listening</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {([
          { part: 1, label: 'Part 1', desc: 'Fotografien',     color: '#22d3ee', subtle: 'rgba(34,211,238,0.12)' },
          { part: 2, label: 'Part 2', desc: 'Frage & Antwort', color: '#06b6d4', subtle: 'rgba(6,182,212,0.12)' },
          { part: 3, label: 'Part 3', desc: 'Gespräche',       color: '#0891b2', subtle: 'rgba(8,145,178,0.12)' },
          { part: 4, label: 'Part 4', desc: 'Monologe',        color: '#0e7490', subtle: 'rgba(14,116,144,0.12)' },
        ] as const).map(({ part, label, desc, color, subtle }) => {
          const prog = progress.find(p => p.part === part)
          const pct  = prog ? Math.round(prog.accuracy * 100) : null
          return (
            <div key={part} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ width: 36, height: 36, background: subtle, color, flexShrink: 0 }}>{part}</div>
                  <div>
                    <p className="font-semibold" style={{ marginBottom: 3 }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-2xl font-bold">{pct !== null ? `${pct}%` : '—'}</p>
                  {prog && <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2 }}>{prog.sampleSize} {t.progress.questions}</p>}
                </div>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct ?? 0}%`, background: color }} />
              </div>
              {!prog && (
                <Link href={`/practice/part${part}`} className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--accent)', marginTop: 10 }}>
                  {t.progress.startPracticing} <ChevronRight size={12} />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Reading parts 5–7 */}
      <h2 className="text-lg font-semibold" style={{ marginBottom: 16 }}>Reading</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {PART_META.map(({ part, label, desc, color, subtle }) => {
          const prog = progress.find(p => p.part === part)
          const pct  = prog ? Math.round(prog.accuracy * 100) : null
          return (
            <div key={part} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ width: 36, height: 36, background: subtle, color, flexShrink: 0 }}>
                    {part}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ marginBottom: 3 }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-2xl font-bold">{pct !== null ? `${pct}%` : '—'}</p>
                  {prog && (
                    <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2 }}>
                      {prog.sampleSize} {t.progress.questions}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct ?? 0}%`, background: color }} />
              </div>
              {prog && (
                <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 10 }}>
                  {t.progress.avgTime.replace('{time}', prog.avgTime.toFixed(1))}
                </p>
              )}
              {!prog && (
                <Link href={`/practice/part${part}`}
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--accent)', marginTop: 10 }}>
                  {t.progress.startPracticing} <ChevronRight size={12} />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Speaking & Writing */}
      <h2 className="text-lg font-semibold" style={{ marginBottom: 16 }}>Speaking & Writing</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 40 }}>
        {([
          { href: '/practice/speaking',      label: 'Speaking', desc: 'KI-Feedback auf deine Antworten',  color: '#fb923c', subtle: 'rgba(251,146,60,0.12)' },
          { href: '/practice/writing/email', label: 'Writing',  desc: 'E-Mail & Aufsatz mit KI-Feedback', color: '#a78bfa', subtle: 'rgba(167,139,250,0.12)' },
        ] as const).map(({ href, label, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '20px 24px', cursor: 'pointer' }}>
              <p className="font-semibold" style={{ marginBottom: 4, color }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Session history */}
      <h2 className="text-lg font-semibold" style={{ marginBottom: 16 }}>{t.progress.sessionHistory}</h2>
      {sessions.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{t.progress.noSessions}</p>
          <Link href="/practice/part5" className="btn-primary">{t.progress.startBtn}</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {[t.progress.table.part, t.progress.table.questions, t.progress.table.score, t.progress.table.accuracy, t.progress.table.time, t.progress.table.date].map(h => (
                  <th key={h} className="text-left font-medium"
                    style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : null
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="font-medium" style={{ padding: '14px 20px' }}>Part {s.parts.join(', ')}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{s.totalQuestions}</td>
                    <td style={{ padding: '14px 20px' }}>{s.score ?? '—'}/{s.maxScore ?? '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {pct !== null ? (
                        <span className="font-semibold" style={{
                          color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--error)'
                        }}>{pct}%</span>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>
                      {s.durationSec ? `${Math.floor(s.durationSec / 60)}m ${s.durationSec % 60}s` : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}