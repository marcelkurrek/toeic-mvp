import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetScore, examDate } = await req.json()

  await prisma.user.upsert({
    where: { supabaseId: user.id },
    update: { targetScore, examDate: examDate ? new Date(examDate) : null },
    create: {
      supabaseId: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      targetScore,
      examDate: examDate ? new Date(examDate) : null,
    }
  })

  return NextResponse.json({ ok: true })
}
