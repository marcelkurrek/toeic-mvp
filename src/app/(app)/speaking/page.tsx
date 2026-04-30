import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SkillLandingPage from '@/components/SkillLandingPage'

export default async function SpeakingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SkillLandingPage
      skill="speaking"
      title="Speaking"
      description="Trainiere deine mündliche Ausdrucksfähigkeit"
      color="#fb923c"
      icon="🎤"
      hasDiagnostic={false}
      tasks={[
        { id: 'read-aloud', label: 'Vorlesen', sub: 'Texte laut lesen', href: '/practice/speaking/read-aloud' },
        { id: 'describe', label: 'Beschreiben', sub: 'Bilder beschreiben', href: '/practice/speaking/describe' },
        { id: 'respond', label: 'Antworten', sub: 'Fragen beantworten', href: '/practice/speaking/respond' },
      ]}
    />
  )
}
