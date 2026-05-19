import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { computeStreak } from '@/lib/streak'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Headphones, Mic, PenLine } from 'lucide-react'

const SECTION_COLORS: Record<string, string> = {
  LISTENING: '#22d3ee', READING: '#4ade80', SPEAKING: '#fb923c', WRITING: '#a78bfa',
}

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const dbUser = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      levels: true,
      progress: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        where: { completedAt: { not: null } },
        include: { answers: { select: { isCorrect: true } } },
      },
    },
  })

  if (!dbUser) notFound()

  const streak = computeStreak(dbUser.sessions.map(s => s.createdAt))
  const totalAnswers = dbUser.sessions.reduce((sum, s) => sum + s.answers.length, 0)
  const correctAnswers = dbUser.sessions.reduce((sum, s) => sum + s.answers.filter(a => a.isCorrect).length, 0)
  const overallAccuracy = totalAnswers > 0 ? Math.round(correctAnswers / totalAnswers * 100) : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 13, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Zurück zur Nutzerliste
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 4 }}>{dbUser.name ?? 'Kein Name'}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{dbUser.email} · Registriert {new Date(dbUser.createdAt).toLocaleDateString('de-DE')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Sitzungen', value: dbUser.sessions.length },
          { label: 'Ø Genauigkeit', value: overallAccuracy !== null ? `${overallAccuracy}%` : '—' },
          { label: 'Streak', value: `${streak.current}d` },
          { label: 'Längste Serie', value: `${streak.longest}d` },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.06em' }}>{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Profile */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h2 className="text-sm font-semibold" style={{ marginBottom: 16 }}>Profil</h2>
          {[
            { label: 'Prüfungstyp', value: dbUser.examType ?? '—' },
            { label: 'Prüfungsdatum', value: dbUser.examDate ? new Date(dbUser.examDate).toLocaleDateString('de-DE') : '—' },
            { label: 'Einstufung', value: dbUser.diagnosticDone ? '✓ Abgeschlossen' : '— Ausstehend' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* CEFR Levels */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h2 className="text-sm font-semibold" style={{ marginBottom: 16 }}>CEFR-Niveaus</h2>
          {(['LISTENING', 'READING', 'SPEAKING', 'WRITING'] as const).map(sec => {
            const level = dbUser.levels.find(l => l.section === sec)
            const color = SECTION_COLORS[sec]
            const Icon = sec === 'LISTENING' ? Headphones : sec === 'WRITING' ? PenLine : sec === 'SPEAKING' ? Mic : BookOpen
            return (
              <div key={sec} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={13} style={{ color }} />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{sec}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: level ? color : 'var(--card-border)' }}>
                  {level ? level.cefr : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Session history */}
      <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Sitzungsverlauf ({dbUser.sessions.length})</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Modus', 'Parts', 'Punkte', 'Genauigkeit', 'Dauer', 'Datum'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dbUser.sessions.map((s, i) => {
              const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : null
              return (
                <tr key={s.id} style={{ borderBottom: i < dbUser.sessions.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{s.mode}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{s.parts.length > 0 ? s.parts.map(p => `P${p}`).join(', ') : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{s.score ?? '—'}/{s.maxScore ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {pct !== null ? (
                      <span style={{ fontWeight: 700, fontSize: 12, color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)' }}>{pct}%</span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{s.durationSec ? `${Math.floor(s.durationSec / 60)}m ${s.durationSec % 60}s` : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{new Date(s.createdAt).toLocaleDateString('de-DE')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {dbUser.sessions.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Noch keine Sitzungen.</p>
        )}
      </div>
    </div>
  )
}
