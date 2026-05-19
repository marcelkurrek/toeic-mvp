import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { Section, QuestionType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const section    = searchParams.get('section') as Section | null
    const part       = searchParams.get('part') ? Number(searchParams.get('part')) : null
    const search     = searchParams.get('search') ?? ''
    const page       = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize   = 25

    const where = {
      ...(section ? { section } : {}),
      ...(part    ? { part }    : {}),
      ...(search  ? {
        OR: [
          { answer: { contains: search, mode: 'insensitive' as const } },
          { explanation: { contains: search, mode: 'insensitive' as const } },
          { tags: { has: search } },
        ],
      } : {}),
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: [{ section: 'asc' }, { part: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          section: true,
          part: true,
          type: true,
          difficulty: true,
          isDiagnostic: true,
          tags: true,
          answer: true,
          explanation: true,
          createdAt: true,
          _count: { select: { answers: true } },
        },
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({
      questions,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    })
  } catch (err) {
    console.error('[GET /api/admin/questions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { section, part, type, content, options, answer, explanation, difficulty, tags, isDiagnostic } = body

    if (!section || !part || !type || !content || !answer) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen: section, part, type, content, answer' }, { status: 400 })
    }
    if (!Object.values(Section).includes(section)) {
      return NextResponse.json({ error: 'Ungültige Section' }, { status: 400 })
    }
    if (!Object.values(QuestionType).includes(type)) {
      return NextResponse.json({ error: 'Ungültiger QuestionType' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        section,
        part: Number(part),
        type,
        content,
        options: options ?? null,
        answer,
        explanation: explanation ?? null,
        difficulty: difficulty ? Math.min(5, Math.max(1, Number(difficulty))) : 3,
        tags: Array.isArray(tags) ? tags : [],
        isDiagnostic: Boolean(isDiagnostic),
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/questions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
