import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import Link from 'next/link'
import { QuestionsTable } from './QuestionsTable'
import { QuestionsFilter } from './QuestionsFilter'

const SECTION_COLORS: Record<string, string> = {
  LISTENING: '#22d3ee',
  READING:   '#4ade80',
  SPEAKING:  '#fb923c',
  WRITING:   '#a78bfa',
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; part?: string; page?: string; search?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const sp      = await searchParams
  const section = sp.section ?? ''
  const part    = sp.part    ? Number(sp.part) : 0
  const search  = sp.search  ?? ''
  const page    = Math.max(1, Number(sp.page ?? 1))
  const pageSize = 25

  const where: Record<string, unknown> = {
    ...(section ? { section: section as never } : {}),
    ...(part    ? { part } : {}),
    ...(search  ? {
      OR: [
        { answer:      { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ],
    } : {}),
  }

  const showList = section || part > 0 || !!search

  const [totalCount, bySection, byPart, diagnosticCount, questions, filteredTotal] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ['section'], _count: { _all: true } }),
    showList ? Promise.resolve([]) : prisma.question.groupBy({ by: ['section', 'part'], _count: { _all: true }, orderBy: [{ section: 'asc' }, { part: 'asc' }] }),
    prisma.question.count({ where: { isDiagnostic: true } }),
    showList ? prisma.question.findMany({
      where,
      orderBy: [{ section: 'asc' }, { part: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, section: true, part: true, type: true,
        difficulty: true, isDiagnostic: true, tags: true,
        answer: true, explanation: true, createdAt: true,
        _count: { select: { answers: true } },
      },
    }) : Promise.resolve([]),
    showList ? prisma.question.count({ where }) : Promise.resolve(0),
  ])

  // For the not-showList case, we need byPart from the non-awaited prisma call
  const byPartData = showList ? [] : byPart

  const pages = Math.ceil(filteredTotal / pageSize)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Fragen-Datenbank</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{totalCount} Fragen gesamt · {diagnosticCount} Diagnose-Fragen</p>
        </div>
        <Link
          href="/admin/questions/new"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--accent)', borderRadius: 8, padding: '9px 16px', textDecoration: 'none' }}
        >
          + Neue Frage
        </Link>
      </div>

      {/* Section stats — clickable filter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {bySection.map(row => (
          <Link key={row.section} href={`/admin/questions?section=${row.section}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '18px 20px', cursor: 'pointer', border: section === row.section ? `1.5px solid ${SECTION_COLORS[row.section]}` : undefined }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: SECTION_COLORS[row.section] ?? 'var(--accent)', marginBottom: 8 }}>
                {row.section}
              </p>
              <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{row._count._all}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Fragen</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Search / filter bar */}
      <QuestionsFilter />

      {/* Part breakdown — only when no active filter */}
      {!showList && (
        <>
          <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Aufschlüsselung nach Part</h2>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 36 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Section', 'Part', 'Anzahl Fragen', ''].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byPartData.map((row, i) => (
                  <tr key={`${row.section}-${row.part}`} style={{ borderBottom: i < byPartData.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${SECTION_COLORS[row.section] ?? 'var(--accent)'}20`, color: SECTION_COLORS[row.section] ?? 'var(--accent)' }}>
                        {row.section}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 500 }}>Part {row.part}</td>
                    <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>{row._count._all}</td>
                    <td style={{ padding: '12px 18px' }}>
                      <Link href={`/admin/questions?section=${row.section}&part=${row.part}`} style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                        Anzeigen →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {byPartData.length === 0 && (
              <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Keine Fragen in der Datenbank.</p>
            )}
          </div>
        </>
      )}

      {/* Filtered questions list */}
      {showList && (
        <QuestionsTable
          questions={questions as never}
          total={filteredTotal}
          page={page}
          pages={pages}
          section={section}
          part={part}
          search={search}
          sectionColors={SECTION_COLORS}
        />
      )}
    </div>
  )
}
