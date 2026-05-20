import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { sessions: true } },
        levels: true,
      },
    })

    const headers = ['ID', 'Name', 'E-Mail', 'Prüfungstyp', 'Prüfungsdatum', 'Diagnose', 'Sitzungen', 'CEFR Reading', 'CEFR Listening', 'Registriert']
    const rows = users.map(u => [
      u.id,
      u.name ?? '',
      u.email,
      u.examType ?? '',
      u.examDate ? u.examDate.toISOString().slice(0, 10) : '',
      u.diagnosticDone ? 'ja' : 'nein',
      u._count.sessions,
      u.levels.find(l => l.section === 'READING')?.cefr ?? '',
      u.levels.find(l => l.section === 'LISTENING')?.cefr ?? '',
      u.createdAt.toISOString().slice(0, 10),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/export/users]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
