import AppLayoutClient from '@/components/AppLayoutClient'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = isAdminEmail(user?.email)

  return (
    <AppLayoutClient isAdmin={isAdmin}>
      {children}
    </AppLayoutClient>
  )
}
