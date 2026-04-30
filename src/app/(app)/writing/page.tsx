import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function WritingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SkillLandingPage
      skill="writing"
      title="Writing"
      description="Verbessere deine schriftliche Ausdrucksfähigkeit"
      color="#a78bfa"
      icon="✍️"
      hasDiagnostic={false}
      tasks={[
        { id: 'sentences', label: 'Sätze schreiben', sub: 'Zu Bildern', href: '/practice/writing/sentences' },
        { id: 'email', label: 'E-Mail verfassen', sub: 'Auf Anfragen antworten', href: '/practice/writing/email' },
        { id: 'essay', label: 'Essay', sub: 'Meinung ausdrücken', href: '/practice/writing/essay' },
      ]}
    />
  )
}
