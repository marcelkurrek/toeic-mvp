import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ answers: [] })

    const answers = await prisma.answer.findMany({
      where: { session: { userId: dbUser.id }, isCorrect: false },
      include: {
        question: {
          select: { id: true, section: true, part: true, content: true, options: true, answer: true, explanation: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ answers })
  } catch (err) {
    console.error('[GET /api/answers/wrong]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
