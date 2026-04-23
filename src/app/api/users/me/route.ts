import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(dbUser)
  } catch (err) {
    console.error('[GET /api/users/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { examType, examDate, name } = body

    const dbUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {
        ...(examType !== undefined && { examType }),
        ...(examDate !== undefined && { examDate: examDate ? new Date(examDate) : null }),
        ...(name !== undefined && { name }),
      },
      create: {
        supabaseId: user.id,
        email: user.email!,
        name: name ?? user.user_metadata?.name ?? null,
        examType: examType ?? null,
        examDate: examDate ? new Date(examDate) : null,
      },
    })

    return NextResponse.json(dbUser)
  } catch (err) {
    console.error('[PUT /api/users/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
