import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FullExam from './FullExam'

export default async function FullExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <FullExam />
}
