import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import Link from 'next/link'
import { QuestionForm } from '../../QuestionForm'

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const { id } = await params
  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) notFound()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/questions" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginTop: 10, marginBottom: 6 }}>Frage bearbeiten</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {question.section} · Part {question.part} · {question.type.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="card" style={{ padding: '28px 32px' }}>
        <QuestionForm
          mode="edit"
          initial={{
            id: question.id,
            section: question.section,
            part: question.part,
            type: question.type,
            content: question.content,
            options: question.options,
            answer: question.answer,
            explanation: question.explanation ?? '',
            difficulty: question.difficulty,
            tags: question.tags,
            isDiagnostic: question.isDiagnostic,
          }}
        />
      </div>
    </div>
  )
}
