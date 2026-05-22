import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { DistractorType } from '@prisma/client'
import { analyzeDistractor, calculateUrgencyScore } from '@/lib/distractor-analyzer'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { id } = await params

    // Fetch session with all answers and question details
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        answers: {
          include: { question: true },
        },
      },
    })

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.userId !== dbUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Analyze errors
    const errorsByType: Record<DistractorType | 'OTHER', number> = {
      [DistractorType.SOUND_ALIKE]: 0,
      [DistractorType.HOMONYM]: 0,
      [DistractorType.RELATED_WORD]: 0,
      [DistractorType.OMIT_NECESSARY]: 0,
      [DistractorType.ALTER_WORD_ORDER]: 0,
      OTHER: 0,
    }

    const wrongAnswers = []
    let totalCorrect = 0

    for (const answer of session.answers) {
      if (answer.isCorrect) {
        totalCorrect++
      } else {
        // Classify the distractor type
        const distractorType = analyzeDistractor(
          answer.question,
          answer.userAnswer,
          answer.question.answer
        )

        wrongAnswers.push({
          questionId: answer.questionId,
          part: answer.question.part,
          userAnswer: answer.userAnswer,
          correctAnswer: answer.question.answer,
          distractorType: distractorType || 'OTHER',
        })

        if (distractorType) {
          errorsByType[distractorType]++
        } else {
          errorsByType.OTHER++
        }

        // Update distractor type in database
        if (distractorType) {
          await prisma.answer.update({
            where: { id: answer.id },
            data: { distractorType },
          })
        }
      }
    }

    const accuracy = Math.round((totalCorrect / session.totalQuestions) * 100)
    const errorPercentage = 100 - accuracy

    // Calculate average time per question (TOEIC target is 45-90s depending on part)
    const avgTimeSec = session.durationSec ? Math.round(session.durationSec / session.totalQuestions) : 0
    const speedTarget = session.answers[0]?.question.part === 5 ? 45 : session.answers[0]?.question.part === 7 ? 90 : 60
    const speedDiff = avgTimeSec - speedTarget
    const speedFeedback = speedDiff > 0 ? `${speedDiff}s slower than target` : `${Math.abs(speedDiff)}s faster than target`

    // Get top 3 error types
    const topErrors = Object.entries(errorsByType)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }))

    // Build session summary
    const summary = {
      accuracy,
      errorPercentage,
      totalQuestions: session.totalQuestions,
      totalCorrect,
      errorsByType,
      wrongAnswersCount: wrongAnswers.length,
      topErrors,
      avgTimeSec,
      speedTarget,
      speedFeedback,
      generatedAt: new Date(),
    }

    // Save summary to session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: { sessionSummary: summary },
    })

    // Update or create error patterns for user
    for (const [distractorType, count] of Object.entries(errorsByType)) {
      if (count > 0 && distractorType !== 'OTHER') {
        const pattern = await prisma.errorPattern.findUnique({
          where: {
            userId_distractorType: {
              userId: dbUser.id,
              distractorType: distractorType as DistractorType,
            },
          },
        })

        if (pattern) {
          const newFrequency = pattern.frequency + count
          const newUrgency = calculateUrgencyScore(newFrequency, new Date())
          await prisma.errorPattern.update({
            where: {
              userId_distractorType: {
                userId: dbUser.id,
                distractorType: distractorType as DistractorType,
              },
            },
            data: {
              frequency: newFrequency,
              lastOccurredAt: new Date(),
              urgencyScore: newUrgency,
            },
          })
        } else {
          await prisma.errorPattern.create({
            data: {
              userId: dbUser.id,
              distractorType: distractorType as DistractorType,
              frequency: count,
              urgencyScore: calculateUrgencyScore(count, new Date()),
            },
          })
        }
      }
    }

    return NextResponse.json({
      sessionSummary: summary,
      wrongAnswers,
    })
  } catch (err) {
    console.error('[POST /api/sessions/[id]/summary]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET to retrieve session summary if already generated
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { id } = await params
    const session = await prisma.session.findUnique({
      where: { id },
      include: { answers: { include: { question: true } } },
    })

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.userId !== dbUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ sessionSummary: session.sessionSummary })
  } catch (err) {
    console.error('[GET /api/sessions/[id]/summary]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
