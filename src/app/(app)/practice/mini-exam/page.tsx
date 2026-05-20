import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MiniExam from './MiniExam'

export default async function MiniExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <MiniExam />
}
