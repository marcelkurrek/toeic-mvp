import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { Users, BookOpen, BarChart2, TrendingUp, Activity, Clock, Target } from 'lucide-react'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers, totalQuestions, totalSessions,
    newUsersThisWeek, sessionsThisWeek, sessionsThisMonth,
    diagnosticDoneCount, avgSessionData, recentUsers,
    topPartStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.session.count({ where: { completedAt: { not: null } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.session.count({ where: { completedAt: { not: null }, createdAt: { gte: sevenDaysAgo } } }),
    prisma.session.count({ where: { completedAt: { not: null }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { diagnosticDone: true } }),
    prisma.session.aggregate({
      where: { completedAt: { not: null }, score: { not: null }, maxScore: { not: null } },
      _avg: { durationSec: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, email: true, examType: true, diagnosticDone: true, createdAt: true,
        _count: { select: { sessions: true } } },
    }),
    prisma.progress.groupBy({
      by: ['part'],
      _avg: { accuracy: true },
      _count: { _all: true },
      orderBy: { part: 'asc' },
    }),
  ])

  const diagnosticPct = totalUsers > 0 ? Math.round(diagnosticDoneCount / totalUsers * 100) : 0
  const avgDuration   = avgSessionData._avg.durationSec
    ? Math.round(avgSessionData._avg.durationSec / 60)
    : null

  const statCards = [
    { label: 'Nutzer gesamt', value: totalUsers, sub: `+${newUsersThisWeek} diese Woche`, icon: Users,     color: 'var(--accent)', bg: 'var(--accent-subtle)', href: '/admin/users' },
    { label: 'Fragen in DB',  value: totalQuestions, sub: 'in der Datenbank',             icon: BookOpen,  color: '#4ade80',      bg: 'rgba(74,222,128,0.12)', href: '/admin/questions' },
    { label: 'Abgeschl. Sitzungen', value: totalSessions, sub: `${sessionsThisMonth} diesen Monat`, icon: BarChart2, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', href: '/admin/sessions' },
    { label: 'Diagnose gemacht', value: `${diagnosticPct}%`, sub: `${diagnosticDoneCount} von ${totalUsers} Nutzern`, icon: TrendingUp, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', href: '/admin/users' },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Admin-Übersicht</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>System-Statistiken und letzte Nutzer</p>
      </div>

      {/* Main stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="card" style={{ padding: '18px 20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { icon: Activity,  color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', label: 'Sitzungen (7 Tage)', value: sessionsThisWeek.toString() },
          { icon: Clock,     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Ø Sitzungsdauer',    value: avgDuration !== null ? `${avgDuration} min` : '—' },
          { icon: Target,    color: '#4ade80', bg: 'rgba(74,222,128,0.12)', label: 'Aktive Nutzer/Monat', value: `${Math.round(sessionsThisMonth / Math.max(1, 30))} / Tag` },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>

        {/* Average accuracy by Part */}
        <div>
          <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Ø Genauigkeit nach Part</h2>
          <div className="card" style={{ padding: '20px 22px' }}>
            {topPartStats.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Daten.</p>
            )}
            {topPartStats.map(row => {
              const pct = row._avg.accuracy ? Math.round(row._avg.accuracy * 100) : 0
              const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : '#ef4444'
              return (
                <div key={row.part} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Part {row.part}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{row._count._all} Einträge</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: color, width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recently registered users */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="text-base font-semibold">Zuletzt registriert</h2>
            <Link href="/admin/users" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Alle anzeigen →
            </Link>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recentUsers.map((u, i) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                  borderBottom: i < recentUsers.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                      {(u.name ?? u.email).slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name ?? u.email.split('@')[0]}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--muted)' }}>
                      {u._count.sessions} Sitzungen · {new Date(u.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                    background: u.diagnosticDone ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.12)',
                    color: u.diagnosticDone ? 'var(--success)' : '#fb923c',
                  }}>
                    {u.diagnosticDone ? '✓' : '—'}
                  </span>
                </div>
              </Link>
            ))}
            {recentUsers.length === 0 && (
              <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Noch keine Nutzer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
