import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Section } from '@prisma/client'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Map accuracy to a target difficulty range [min, max] (1–5 scale) */
function difficultyRange(accuracy: number | null): [number, number] {
  if (accuracy === null) return [2, 3]   // first time: medium
  if (accuracy < 0.40)  return [1, 2]   // struggling: easy
  if (accuracy < 0.60)  return [1, 3]   // below avg: easy-medium
  if (accuracy < 0.75)  return [2, 4]   // average: medium
  if (accuracy < 0.88)  return [3, 5]   // good: medium-hard
  return [4, 5]                          // excellent: hard only
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url      = new URL(request.url)
    const part     = url.searchParams.get('part')
    const section  = url.searchParams.get('section') as Section | null
    const diagMode = url.searchParams.get('diagnostic')
    const adaptive = url.searchParams.get('adaptive') === 'true'
    const limit    = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 10)))

    const tag = url.searchParams.get('tag')

    const baseWhere: Record<string, unknown> = {}
    if (part)     baseWhere.part = parseInt(part)
    if (section)  baseWhere.section = section
    if (diagMode) baseWhere.isDiagnostic = diagMode === 'true'
    if (tag)      baseWhere.tags = { has: tag }

    if (!adaptive) {
      const questions = await prisma.question.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'asc' },
        take: limit,
      })
      return NextResponse.json({ questions, adaptive: false })
    }

    // ── Adaptive mode ──────────────────────────────────────────────────────
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) {
      const questions = await prisma.question.findMany({ where: baseWhere, orderBy: { createdAt: 'asc' } })
      return NextResponse.json({ questions, adaptive: false })
    }

    // 1. Get user's current accuracy for this part
    const progress = part
      ? await prisma.progress.findFirst({ where: { userId: dbUser.id, part: parseInt(part) } })
      : null
    const accuracy = progress?.accuracy ?? null

    // 2. Get recently answered question IDs (last 40) to avoid repetition
    const recentAnswers = await prisma.answer.findMany({
      where: {
        session: { userId: dbUser.id },
        question: part ? { part: parseInt(part) } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: { questionId: true },
    })
    const recentIds = new Set(recentAnswers.map(a => a.questionId))

    // 3. Determine target difficulty
    const [minDiff, maxDiff] = difficultyRange(accuracy)

    // 4. Query: prefer target difficulty, not recently answered
    const preferredWhere = {
      ...baseWhere,
      difficulty: { gte: minDiff, lte: maxDiff },
      id: { notIn: recentIds.size > 0 ? [...recentIds] : undefined },
    }

    let preferred = await prisma.question.findMany({ where: preferredWhere })

    // 5. If not enough preferred questions, fill with anything not recently seen
    if (preferred.length < limit) {
      const fillWhere = {
        ...baseWhere,
        id: { notIn: recentIds.size > 0 ? [...recentIds] : undefined },
        NOT: preferredWhere.difficulty ? { difficulty: { gte: minDiff, lte: maxDiff } } : undefined,
      }
      const filler = await prisma.question.findMany({ where: fillWhere })
      preferred = [...preferred, ...filler]
    }

    // 6. If still not enough (user answered everything), include recent ones
    if (preferred.length < limit) {
      const fallback = await prisma.question.findMany({ where: baseWhere })
      const seen = new Set(preferred.map(q => q.id))
      preferred = [...preferred, ...fallback.filter(q => !seen.has(q.id))]
    }

    const questions = shuffle(preferred).slice(0, limit)
    return NextResponse.json({ questions, adaptive: true, difficulty: { min: minDiff, max: maxDiff }, accuracy })
  } catch (err) {
    console.error('[GET /api/questions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
