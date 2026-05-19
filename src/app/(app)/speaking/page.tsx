import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function SpeakingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { progress: { where: { section: 'SPEAKING' } } },
  })

  const partAccuracy = Object.fromEntries(
    (dbUser?.progress ?? []).map(p => [p.part, { accuracy: p.accuracy, sampleSize: p.sampleSize }])
  )

  return (
    <SkillLandingPage
      skill="speaking"
      title="Speaking"
      description="Trainiere deine mündliche Ausdrucksfähigkeit"
      color="#fb923c"
      icon="🎤"
      hasDiagnostic={!!dbUser?.diagnosticDone}
      partAccuracy={partAccuracy}
      tasks={[
        { id: 'read-aloud',  label: 'Q1–2',  sub: 'Vorlesen (Read Aloud)',          href: '/practice/speaking/read-aloud',  part: 1 },
        { id: 'describe',    label: 'Q3–4',  sub: 'Bild beschreiben',               href: '/practice/speaking/describe',    part: 2 },
        { id: 'respond',     label: 'Q5–7',  sub: 'Fragen beantworten',             href: '/practice/speaking/respond',     part: 3 },
        { id: 'respond-doc', label: 'Q8–10', sub: 'Antwort mit Dokument',           href: '/practice/speaking/respond-doc', part: 4 },
        { id: 'opinion',     label: 'Q11',   sub: 'Meinung äußern (Express Opinion)', href: '/practice/speaking/opinion',  part: 5 },
      ]}
    />
  )
}
