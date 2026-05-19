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

    const sessions = await prisma.session.findMany({
      where: { completedAt: { not: null } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true, email: true } } },
    })

    const headers = ['Session-ID', 'Nutzer-Name', 'Nutzer-E-Mail', 'Modus', 'Parts', 'Fragen', 'Punkte', 'Max-Punkte', 'Genauigkeit', 'Dauer (s)', 'Datum']
    const rows = sessions.map(s => {
      const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : ''
      return [
        s.id,
        s.user.name ?? '',
        s.user.email,
        s.mode,
        s.parts.join(';'),
        s.totalQuestions,
        s.score ?? '',
        s.maxScore ?? '',
        pct !== '' ? `${pct}%` : '',
        s.durationSec ?? '',
        s.createdAt.toISOString().slice(0, 10),
      ]
    })

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sessions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/export/sessions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
