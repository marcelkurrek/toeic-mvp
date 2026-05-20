import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = isAdminEmail(user?.email)

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
