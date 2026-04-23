import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Section } from '@prisma/client'

function accuracyToCefr(accuracy: number): string {
  if (accuracy >= 0.90) return 'C2'
  if (accuracy >= 0.80) return 'C1'
  if (accuracy >= 0.65) return 'B2'
  if (accuracy >= 0.50) return 'B1'
  if (accuracy >= 0.35) return 'A2'
  return 'A1'
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    // mcAnswers: MC questions with auto-grading
    // openScores: pre-graded CEFR from AI for open-ended S&W
    const { mcAnswers, openScores } = body as {
      mcAnswers: Array<{ questionId: string; section: Section; isCorrect: boolean; userAnswer: string }>
      openScores: Array<{ section: Section; cefr: string; score: number }>
    }

    // Group MC answers by section
    const sectionStats: Record<string, { correct: number; total: number }> = {}
    for (const a of (mcAnswers ?? [])) {
      if (!sectionStats[a.section]) sectionStats[a.section] = { correct: 0, total: 0 }
      sectionStats[a.section].total++
      if (a.isCorrect) sectionStats[a.section].correct++
    }

    // Build UserLevel upserts
    const levels: Array<{ section: Section; cefr: string; score: number }> = []

    for (const [section, stats] of Object.entries(sectionStats)) {
      const accuracy = stats.correct / stats.total
      levels.push({ section: section as Section, cefr: accuracyToCefr(accuracy), score: accuracy })
    }

    // Add open-ended scores
    for (const os of (openScores ?? [])) {
      const existing = levels.find(l => l.section === os.section)
      if (existing) {
        // Average MC and open-ended scores
        existing.score = (existing.score + os.score) / 2
        existing.cefr  = accuracyToCefr(existing.score)
      } else {
        levels.push(os)
      }
    }

    // Save all UserLevel records
    for (const level of levels) {
      await prisma.userLevel.upsert({
        where: { userId_section: { userId: dbUser.id, section: level.section } },
        update:  { cefr: level.cefr, score: level.score },
        create:  { userId: dbUser.id, section: level.section, cefr: level.cefr, score: level.score },
      })
    }

    // Create diagnostic session
    const session = await prisma.session.create({
      data: {
        userId:         dbUser.id,
        mode:           'DIAGNOSTIC',
        parts:          [],
        totalQuestions: (mcAnswers ?? []).length,
        completedAt:    new Date(),
      },
    })

    // Save MC answers
    if (mcAnswers?.length) {
      await prisma.answer.createMany({
        data: mcAnswers.map(a => ({
          sessionId:  session.id,
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          isCorrect:  a.isCorrect,
        })),
        skipDuplicates: true,
      })
    }

    // Mark diagnostic done
    await prisma.user.update({
      where: { id: dbUser.id },
      data:  { diagnosticDone: true },
    })

    return NextResponse.json({ levels })
  } catch (err) {
    console.error('[POST /api/diagnostic]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
