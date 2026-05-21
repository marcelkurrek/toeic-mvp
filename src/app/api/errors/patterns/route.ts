import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get error patterns for this user, sorted by urgency
    const errorPatterns = await prisma.errorPattern.findMany({
      where: { userId: dbUser.id },
      orderBy: { urgencyScore: 'desc' },
    })

    return NextResponse.json({ errorPatterns })
  } catch (err) {
    console.error('[GET /api/errors/patterns]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
