import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const distractorType = searchParams.get('type')

    // Get wrong answers for this user
    const answers = await prisma.answer.findMany({
      where: {
        session: { userId: dbUser.id },
        isCorrect: false,
        distractorType: distractorType ? distractorType : undefined,
      },
      include: {
        question: {
          select: { part: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const formattedAnswers = answers.map(a => ({
      id: a.id,
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      correctAnswer: a.question.answer,
      distractorType: a.distractorType || 'OTHER',
      part: a.question.part,
      createdAt: a.createdAt.toISOString(),
    }))

    return NextResponse.json({ answers: formattedAnswers })
  } catch (err) {
    console.error('[GET /api/errors/answers]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
