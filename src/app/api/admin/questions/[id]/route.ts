import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { Section, QuestionType } from '@prisma/client'

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(question)
  } catch (err) {
    console.error('[GET /api/admin/questions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const { section, part, type, content, options, answer, explanation, difficulty, tags, isDiagnostic } = body

    if (section && !Object.values(Section).includes(section)) {
      return NextResponse.json({ error: 'Ungültige Section' }, { status: 400 })
    }
    if (type && !Object.values(QuestionType).includes(type)) {
      return NextResponse.json({ error: 'Ungültiger QuestionType' }, { status: 400 })
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(section     !== undefined ? { section }     : {}),
        ...(part        !== undefined ? { part: Number(part) } : {}),
        ...(type        !== undefined ? { type }        : {}),
        ...(content     !== undefined ? { content }     : {}),
        ...(options     !== undefined ? { options }     : {}),
        ...(answer      !== undefined ? { answer }      : {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(difficulty  !== undefined ? { difficulty: Math.min(5, Math.max(1, Number(difficulty))) } : {}),
        ...(tags        !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
        ...(isDiagnostic !== undefined ? { isDiagnostic: Boolean(isDiagnostic) } : {}),
      },
    })
    return NextResponse.json(question)
  } catch (err) {
    console.error('[PUT /api/admin/questions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await guardAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = await params
    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/questions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
