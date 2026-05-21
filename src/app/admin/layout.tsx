import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, BarChart2, ShieldAlert, ListChecks, ArrowLeft } from 'lucide-react'

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
        padding: '16px 12px 16px',
      }}>
        {/* Back to App — prominent at the top */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg transition-all"
          style={{
            padding: '8px 12px',
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--accent)',
            textDecoration: 'none',
            background: 'var(--accent-subtle)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
          }}
        >
          <ArrowLeft size={14} />
          Zurück zur App
        </Link>

        {/* Admin brand */}
        <div className="flex items-center gap-2 px-3 py-2 mb-4" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: 12 }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: '#ef4444', color: '#ffffff' }}>
            <ShieldAlert size={14} />
          </div>
          <span className="font-bold text-sm">Admin-Bereich</span>
        </div>

        <nav className="flex flex-col gap-1">
          <AdminNavItem href="/admin" label="Übersicht" icon={LayoutDashboard} />
          <AdminNavItem href="/admin/users" label="Nutzer" icon={Users} />
          <AdminNavItem href="/admin/questions" label="Fragen" icon={BookOpen} />
          <AdminNavItem href="/admin/sessions" label="Sitzungen" icon={BarChart2} />
          <AdminNavItem href="/admin/action-plan" label="Action Plan" icon={ListChecks} />
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
