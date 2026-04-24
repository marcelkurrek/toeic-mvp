import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Section } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const part       = url.searchParams.get('part')
    const section    = url.searchParams.get('section') as Section | null
    const diagnostic = url.searchParams.get('diagnostic')

    const where: Record<string, unknown> = {}
    if (part)       where.part = parseInt(part)
    if (section)    where.section = section
    if (diagnostic) where.isDiagnostic = diagnostic === 'true'

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('[GET /api/questions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
