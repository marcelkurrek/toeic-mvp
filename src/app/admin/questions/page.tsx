import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'

const SECTION_COLORS: Record<string, string> = {
  LISTENING: '#22d3ee',
  READING: '#4ade80',
  SPEAKING: '#fb923c',
  WRITING: '#a78bfa',
}

export default async function AdminQuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const [totalCount, bySection, byPart, diagnosticCount] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ['section'], _count: { _all: true } }),
    prisma.question.groupBy({ by: ['section', 'part'], _count: { _all: true }, orderBy: [{ section: 'asc' }, { part: 'asc' }] }),
    prisma.question.count({ where: { isDiagnostic: true } }),
  ])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Fragen-Datenbank</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{totalCount} Fragen gesamt · {diagnosticCount} Diagnose-Fragen</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {bySection.map(row => (
          <div key={row.section} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: SECTION_COLORS[row.section] ?? 'var(--accent)', marginBottom: 8 }}>
              {row.section}
            </p>
            <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{row._count._all}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Fragen</p>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Aufschlüsselung nach Part</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Section', 'Part', 'Anzahl Fragen'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byPart.map((row, i) => (
              <tr key={`${row.section}-${row.part}`} style={{ borderBottom: i < byPart.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: `${SECTION_COLORS[row.section] ?? 'var(--accent)'}20`,
                    color: SECTION_COLORS[row.section] ?? 'var(--accent)',
                  }}>
                    {row.section}
                  </span>
                </td>
                <td style={{ padding: '12px 18px', fontWeight: 500 }}>Part {row.part}</td>
                <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>{row._count._all}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {byPart.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Keine Fragen in der Datenbank.</p>
        )}
      </div>
    </div>
  )
}
