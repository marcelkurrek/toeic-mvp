import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FlashcardDeck } from './FlashcardDeck'
import { VOCAB_WORDS } from '@/lib/vocabulary'

export default async function VocabularyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Vokabeln</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {VOCAB_WORDS.length} TOEIC-Schlüsselwörter — tippe eine Karte um die Übersetzung zu sehen
        </p>
      </div>
      <FlashcardDeck />
    </div>
  )
}
