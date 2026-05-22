import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const url  = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const dbUser = await prisma.user.upsert({
        where: { supabaseId: data.user.id },
        update: {},
        create: {
          supabaseId: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name ?? null,
        },
      })

      // If user hasn't completed onboarding (no examGoal), redirect to onboarding
      const redirectUrl = !dbUser.examGoal ? '/onboarding' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
