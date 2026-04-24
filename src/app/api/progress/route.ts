import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ progress: [] })

    const progress = await prisma.progress.findMany({
      where: { userId: dbUser.id },
      orderBy: { part: 'asc' },
    })

    return NextResponse.json({ progress })
  } catch (err) {
    console.error('[GET /api/progress]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
