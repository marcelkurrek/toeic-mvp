import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, BarChart2, ShieldAlert } from 'lucide-react'

function AdminNavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{ color: 'var(--muted)', textDecoration: 'none' }}
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex flex-col shrink-0" style={{
        width: 220,
        background: 'var(--card)',
        borderRight: '1px solid var(--card-border)',
        minHeight: '100vh',
        padding: '24px 12px 16px',
      }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: '#ef4444', color: '#ffffff' }}>
            <ShieldAlert size={16} />
          </div>
          <span className="font-bold text-sm">Admin</span>
        </div>

        <nav className="flex flex-col gap-1">
          <AdminNavItem href="/admin" label="Übersicht" icon={LayoutDashboard} />
          <AdminNavItem href="/admin/users" label="Nutzer" icon={Users} />
          <AdminNavItem href="/admin/questions" label="Fragen" icon={BookOpen} />
          <AdminNavItem href="/admin/sessions" label="Sitzungen" icon={BarChart2} />
        </nav>

        <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs"
            style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            ← Zurück zur App
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
