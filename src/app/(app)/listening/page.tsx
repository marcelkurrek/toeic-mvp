import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function ListeningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { progress: { where: { section: 'LISTENING' } } },
  })

  const partAccuracy = Object.fromEntries(
    (dbUser?.progress ?? []).map(p => [p.part, { accuracy: p.accuracy, sampleSize: p.sampleSize }])
  )

  return (
    <SkillLandingPage
      skill="listening"
      title="Listening"
      description="Trainiere dein Hörverständnis für den TOEIC Test"
      color="#22d3ee"
      icon="🎧"
      hasDiagnostic={!!dbUser?.diagnosticDone}
      partAccuracy={partAccuracy}
      tasks={[
        { id: 'part1', label: 'Part 1', sub: 'Fotos beschreiben', href: '/practice/part1', part: 1 },
        { id: 'part2', label: 'Part 2', sub: 'Frage & Antwort', href: '/practice/part2', part: 2 },
        { id: 'part3', label: 'Part 3', sub: 'Gespräche', href: '/practice/part3', part: 3 },
        { id: 'part4', label: 'Part 4', sub: 'Monologe', href: '/practice/part4', part: 4 },
      ]}
    />
  )
}
