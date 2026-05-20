import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function WritingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { progress: { where: { section: 'WRITING' } } },
  })

  const partAccuracy = Object.fromEntries(
    (dbUser?.progress ?? []).map(p => [p.part, { accuracy: p.accuracy, sampleSize: p.sampleSize }])
  )

  return (
    <SkillLandingPage
      skill="writing"
      title="Writing"
      description="Verbessere deine schriftliche Ausdrucksfähigkeit"
      color="#AE00FF"
      icon="✍️"
      hasDiagnostic={!!dbUser?.diagnosticDone}
      partAccuracy={partAccuracy}
      tasks={[
        { id: 'sentences', label: 'Q1–5', sub: 'Sätze zu Bildern schreiben',     href: '/practice/writing/sentences', part: 1 },
        { id: 'email',     label: 'Q6–7', sub: 'E-Mail verfassen (Respond)',     href: '/practice/writing/email',     part: 2 },
        { id: 'essay',     label: 'Q8',   sub: 'Opinion Essay (300+ Wörter)',    href: '/practice/writing/essay',     part: 3 },
      ]}
    />
  )
}
