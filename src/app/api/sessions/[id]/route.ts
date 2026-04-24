import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Section, QuestionType } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { score, maxScore, durationSec, answers } = body

    const session = await prisma.session.update({
      where: { id: params.id },
      data: { score, maxScore, durationSec, completedAt: new Date() },
    })

    if (answers?.length) {
      await prisma.answer.createMany({
        data: answers.map((a: {
          questionId: string; userAnswer: string; isCorrect: boolean; timeSpentSec: number
        }) => ({
          sessionId:  params.id,
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          isCorrect:  a.isCorrect,
          timeSpentSec: a.timeSpentSec,
        })),
        skipDuplicates: true,
      })

      // Fetch all answers for this user to compute per-(section,part,type) progress
      const allAnswers = await prisma.answer.findMany({
        where:   { session: { userId: dbUser.id } },
        include: { question: { select: { part: true, section: true, type: true } } },
      })

      type Key = string
      const byKey: Record<Key, { correct: number; total: number; totalTime: number; section: Section; part: number; type: QuestionType }> = {}

      for (const a of allAnswers) {
        const { section, part, type } = a.question
        const key = `${section}|${part}|${type}`
        if (!byKey[key]) byKey[key] = { correct: 0, total: 0, totalTime: 0, section, part, type }
        byKey[key].total++
        if (a.isCorrect) byKey[key].correct++
        byKey[key].totalTime += a.timeSpentSec ?? 0
      }

      for (const stats of Object.values(byKey)) {
        await prisma.progress.upsert({
          where: {
            userId_section_part_type: {
              userId:  dbUser.id,
              section: stats.section,
              part:    stats.part,
              type:    stats.type,
            },
          },
          update: {
            accuracy:   stats.correct / stats.total,
            avgTime:    stats.totalTime / stats.total,
            sampleSize: stats.total,
          },
          create: {
            userId:     dbUser.id,
            section:    stats.section,
            part:       stats.part,
            type:       stats.type,
            accuracy:   stats.correct / stats.total,
            avgTime:    stats.totalTime / stats.total,
            sampleSize: stats.total,
          },
        })
      }
    }

    return NextResponse.json(session)
  } catch (err) {
    console.error('[PUT /api/sessions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
