import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { sessions: true } },
      levels: true,
    },
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Nutzerverwaltung</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{users.length} Nutzer gesamt</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Name / E-Mail', 'Prüfungstyp', 'Prüfungsdatum', 'Diagnose', 'Sitzungen', 'CEFR', 'Registriert'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const readingLevel = u.levels.find(l => l.section === 'READING')
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <p className="font-medium" style={{ color: 'var(--accent)' }}>{u.name ?? '—'}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</p>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {u.examType ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {u.examDate ? new Date(u.examDate).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
                      background: u.diagnosticDone ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.15)',
                      color: u.diagnosticDone ? 'var(--success)' : '#fb923c',
                    }}>
                      {u.diagnosticDone ? '✓' : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                    {u._count.sessions}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {readingLevel ? (
                      <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{readingLevel.cefr}</span>
                    ) : <span style={{ color: 'var(--card-border)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Keine Nutzer vorhanden.</p>
        )}
      </div>
    </div>
  )
}
