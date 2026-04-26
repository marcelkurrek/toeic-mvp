import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function ListeningPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  const hasDiagnostic = !!(dbUser as any)?.diagnosticDone

  return (
    <SkillLandingPage
      skill="listening"
      title="Listening"
      description="Trainiere dein Hörverständnis für den TOEIC Test"
      color="#22d3ee"
      icon="🎧"
      hasDiagnostic={hasDiagnostic}
      tasks={[
        { id: 'part1', label: 'Part 1', sub: 'Fotos beschreiben', href: '/practice/part1' },
        { id: 'part2', label: 'Part 2', sub: 'Frage & Antwort', href: '/practice/part2' },
        { id: 'part3', label: 'Part 3', sub: 'Gespräche', href: '/practice/part3' },
        { id: 'part4', label: 'Part 4', sub: 'Monologe', href: '/practice/part4' },
      ]}
    />
  )
}
