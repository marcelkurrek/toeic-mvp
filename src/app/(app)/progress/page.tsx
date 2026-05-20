import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Flame, Trophy, Target } from 'lucide-react'
import { getServerTranslations } from '@/lib/i18n/server'
import { computeStreak } from '@/lib/streak'
import WeeklyHeatmap from '@/components/WeeklyHeatmap'
import ScoreChart from '@/components/ScoreChart'

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

  const streak = computeStreak(sessions.map(s => s.createdAt))
  const totalAnswered = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)
  const overallPct = progress.length
    ? Math.round(progress.reduce((s, p) => s + p.accuracy, 0) / progress.length * 100)
    : null
  const bestPart = progress.length
    ? progress.reduce((best, p) => p.accuracy > best.accuracy ? p : best)
    : null

  const PART_META = [
    { part: 1, label: 'Listening · Part 1', desc: 'Fotos beschreiben (4 Aussagen)',                href: '/practice/part1', color: '#04FF88', subtle: 'rgba(4,255,136,0.10)' },
    { part: 2, label: 'Listening · Part 2', desc: 'Frage-Antwort (3 Antwortmöglichkeiten)',        href: '/practice/part2', color: '#04FF88', subtle: 'rgba(4,255,136,0.10)' },
    { part: 3, label: 'Listening · Part 3', desc: 'Gespräche (3 Fragen pro Konversation)',         href: '/practice/part3', color: '#04FF88', subtle: 'rgba(4,255,136,0.10)' },
    { part: 4, label: 'Listening · Part 4', desc: 'Monologe / Ankündigungen (3 Fragen pro Talk)',  href: '/practice/part4', color: '#04FF88', subtle: 'rgba(4,255,136,0.10)' },
    { part: 5, label: t.progress.parts[5].label, desc: t.progress.parts[5].desc, href: '/practice/part5', color: '#D5FD44', subtle: 'rgba(213,253,68,0.10)' },
    { part: 6, label: t.progress.parts[6].label, desc: t.progress.parts[6].desc, href: '/practice/part6', color: '#D5FD44', subtle: 'rgba(213,253,68,0.10)' },
    { part: 7, label: t.progress.parts[7].label, desc: t.progress.parts[7].desc, href: '/practice/part7', color: '#D5FD44', subtle: 'rgba(213,253,68,0.10)' },
  ]

  return (
    <div>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 8 }}>{t.progress.heading}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>{t.progress.subheading}</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { icon: <Flame size={16} style={{ color: '#fb923c' }} />, bg: 'rgba(251,146,60,0.12)', label: 'Streak', value: streak.current > 0 ? `${streak.current}🔥` : '0', sub: `Längste: ${streak.longest}d` },
          { icon: <Trophy size={16} style={{ color: '#fbbf24' }} />, bg: 'rgba(251,191,36,0.12)', label: 'Ø Genauigkeit', value: overallPct !== null ? `${overallPct}%` : '—', sub: overallPct !== null ? (overallPct >= 80 ? 'Ausgezeichnet' : overallPct >= 60 ? 'Gut' : 'Weiter üben') : 'Noch keine Daten' },
          { icon: <Target size={16} style={{ color: 'var(--accent)' }} />, bg: 'var(--accent-subtle)', label: 'Fragen beantwortet', value: totalAnswered, sub: `${sessions.length} Sitzungen` },
          { icon: <Trophy size={16} style={{ color: 'var(--green)' }} />, bg: 'var(--green-subtle)', label: 'Bester Part', value: bestPart ? `Part ${bestPart.part}` : '—', sub: bestPart ? `${Math.round(bestPart.accuracy * 100)}% Genauigkeit` : 'Noch keine Daten' },
        ].map(({ icon, bg, label, value, sub }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Score trajectory chart */}
      {(() => {
        const chartData = sessions
          .filter(s => s.score != null && s.maxScore)
          .map(s => ({
            date: s.createdAt.toISOString(),
            pct: Math.round((s.score! / s.maxScore!) * 100),
            label: new Date(s.createdAt).toLocaleDateString('de-DE', { month: 'numeric', day: 'numeric' }),
          }))
          .reverse()
        return chartData.length >= 2 ? (
          <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <p className="font-semibold text-sm" style={{ marginBottom: 14 }}>Genauigkeits-Verlauf</p>
            <ScoreChart data={chartData} />
          </div>
        ) : null
      })()}

      {/* Weekly heatmap */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 36 }}>
        <p className="font-semibold text-sm" style={{ marginBottom: 16 }}>Aktivität — letzte 4 Wochen</p>
        <WeeklyHeatmap sessionDates={sessions.map(s => s.createdAt.toISOString())} />
      </div>

      {/* Per-part accuracy */}
      <h2 className="text-lg font-semibold" style={{ marginBottom: 16 }}>{t.progress.accuracyByPart}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {PART_META.map(({ part, label, desc, color, subtle, href }) => {
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
                <Link href={href}
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--accent)', marginTop: 10 }}>
                  {t.progress.startPracticing} <ChevronRight size={12} />
                </Link>
              )}
            </div>
          )
        })}
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
