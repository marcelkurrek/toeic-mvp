import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        progress: true,
        levels: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          where: { completedAt: { not: null } },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({
        stats: { totalSessions: 0, avgAccuracy: null, daysUntilExam: null },
        levels: [],
        progress: [],
        recentSessions: [],
        user: null,
      })
    }

    const totalSessions = dbUser.sessions.length
    const avgAccuracy = dbUser.progress.length
      ? dbUser.progress.reduce((s, p) => s + p.accuracy, 0) / dbUser.progress.length
      : null
    const daysUntilExam = dbUser.examDate
      ? Math.ceil((new Date(dbUser.examDate).getTime() - Date.now()) / 86400000)
      : null

    return NextResponse.json({
      stats: { totalSessions, avgAccuracy, daysUntilExam },
      levels: dbUser.levels,
      progress: dbUser.progress,
      recentSessions: dbUser.sessions,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        examType: dbUser.examType,
        examDate: dbUser.examDate,
        diagnosticDone: dbUser.diagnosticDone,
      },
    })
  } catch (err) {
    console.error('[GET /api/dashboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
