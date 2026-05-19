import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'

export default async function AdminSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const [byMode, recentSessions] = await Promise.all([
    prisma.session.groupBy({
      by: ['mode'],
      _count: { _all: true },
      where: { completedAt: { not: null } },
    }),
    prisma.session.findMany({
      where: { completedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Sitzungen</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Abgeschlossene Übungssitzungen</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {byMode.map(row => (
          <div key={row.mode} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
              {row.mode.replace('_', ' ')}
            </p>
            <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{row._count._all}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Sitzungen</p>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Letzte Sitzungen</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Nutzer', 'Modus', 'Parts', 'Punkte', 'Genauigkeit', 'Dauer', 'Datum'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentSessions.map((s, i) => {
              const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : null
              return (
                <tr key={s.id} style={{ borderBottom: i < recentSessions.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p className="font-medium" style={{ fontSize: 12 }}>{s.user.name ?? '—'}</p>
                    <p style={{ fontSize: 10, color: 'var(--muted)' }}>{s.user.email}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{s.mode}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {s.parts.length > 0 ? s.parts.map(p => `P${p}`).join(', ') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {s.score ?? '—'}/{s.maxScore ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {pct !== null ? (
                      <span style={{
                        fontWeight: 700, fontSize: 12,
                        color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)',
                      }}>{pct}%</span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {s.durationSec ? `${Math.floor(s.durationSec / 60)}m ${s.durationSec % 60}s` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {new Date(s.createdAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {recentSessions.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Noch keine Sitzungen.</p>
        )}
      </div>
    </div>
  )
}
