import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Delete DB user (cascades to sessions, answers, progress, levels)
    await prisma.user.delete({ where: { supabaseId: user.id } })

    // Delete Supabase auth user
    await supabase.auth.admin.deleteUser(user.id).catch(() => {
      // Non-fatal: DB data already deleted
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/users/me/delete]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
