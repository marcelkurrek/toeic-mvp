import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function ReadingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  const hasDiagnostic = !!(dbUser as any)?.diagnosticDone

  return (
    <SkillLandingPage
      skill="reading"
      title="Reading"
      description="Verbessere dein Leseverständnis für den TOEIC Test"
      color="#4ade80"
      icon="📖"
      hasDiagnostic={hasDiagnostic}
      tasks={[
        { id: 'part5', label: 'Part 5', sub: 'Grammatik & Wortschatz', href: '/practice/part5' },
        { id: 'part6', label: 'Part 6', sub: 'Texte ergänzen', href: '/practice/part6' },
        { id: 'part7', label: 'Part 7', sub: 'Lesen & Verstehen', href: '/practice/part7' },
      ]}
    />
  )
}
