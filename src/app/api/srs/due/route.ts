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

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') ?? '20')

    const dueCards = await prisma.srsCard.findMany({
      where: {
        userId:  dbUser.id,
        dueDate: { lte: new Date() },
      },
      include: { question: true },
      orderBy: { dueDate: 'asc' },
      take: limit,
    })

    const dueCount = await prisma.srsCard.count({
      where: {
        userId:  dbUser.id,
        dueDate: { lte: new Date() },
      },
    })

    return NextResponse.json({ cards: dueCards, dueCount })
  } catch (err) {
    console.error('[GET /api/srs/due]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}