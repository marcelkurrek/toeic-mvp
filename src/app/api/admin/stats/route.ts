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

    const [totalUsers, totalQuestions, totalSessions, diagnosticDone, bySection, byMode] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.session.count({ where: { completedAt: { not: null } } }),
      prisma.user.count({ where: { diagnosticDone: true } }),
      prisma.question.groupBy({ by: ['section'], _count: { _all: true } }),
      prisma.session.groupBy({ by: ['mode'], _count: { _all: true }, where: { completedAt: { not: null } } }),
    ])

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalSessions,
      diagnosticDone,
      questionsBySection: bySection,
      sessionsByMode: byMode,
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
