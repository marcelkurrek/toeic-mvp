import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import Link from 'next/link'
import { QuestionForm } from '../QuestionForm'

export default async function NewQuestionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/questions" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginTop: 10, marginBottom: 6 }}>Neue Frage erstellen</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Füge eine neue Frage zur Datenbank hinzu</p>
      </div>

      <div className="card" style={{ padding: '28px 32px' }}>
        <QuestionForm mode="create" />
      </div>
    </div>
  )
}
