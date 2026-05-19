import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { Users, BookOpen, BarChart2, TrendingUp } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const [totalUsers, totalQuestions, totalSessions, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.session.count({ where: { completedAt: { not: null } } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, email: true, examType: true, diagnosticDone: true, createdAt: true },
    }),
  ])

  const diagnosticDoneCount = await prisma.user.count({ where: { diagnosticDone: true } })
  const diagnosticPct = totalUsers > 0 ? Math.round(diagnosticDoneCount / totalUsers * 100) : 0

  const stats = [
    { label: 'Nutzer gesamt', value: totalUsers, icon: Users, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
    { label: 'Fragen in DB', value: totalQuestions, icon: BookOpen, color: 'var(--green)', bg: 'var(--green-subtle)' },
    { label: 'Abgeschl. Sitzungen', value: totalSessions, icon: BarChart2, color: 'var(--purple)', bg: 'var(--purple-subtle)' },
    { label: 'Diagnose gemacht', value: `${diagnosticPct}%`, icon: TrendingUp, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Admin-Übersicht</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>System-Statistiken und letzte Nutzer</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Zuletzt registrierte Nutzer</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Name / E-Mail', 'Prüfungstyp', 'Diagnose', 'Registriert'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < recentUsers.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                <td style={{ padding: '12px 18px' }}>
                  <p className="font-medium">{u.name ?? '—'}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</p>
                </td>
                <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>
                  {u.examType ?? <span style={{ color: 'var(--card-border)' }}>—</span>}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: u.diagnosticDone ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.15)',
                    color: u.diagnosticDone ? 'var(--success)' : '#fb923c',
                  }}>
                    {u.diagnosticDone ? 'Fertig' : 'Ausstehend'}
                  </span>
                </td>
                <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('de-DE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentUsers.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Noch keine Nutzer.</p>
        )}
      </div>
    </div>
  )
}
