'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, LogOut, Info, Zap, Headphones, BookOpen, Mic, PenLine } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold px-3"
      style={{
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: 10,
        paddingTop: '20px',
        paddingBottom: '8px',
        marginTop: '8px'
      }}>
      {label}
    </p>
  )
}

function NavItem({
  href, label, sub, icon: Icon, exact = false,
}: {
  href: string
  label: string
  sub?: string
  icon: React.ElementType
  exact?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 rounded-lg transition-all"
      style={{
        paddingTop: '10px',
        paddingBottom: '10px',
        marginBottom: '2px',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--muted)',
        textDecoration: 'none',
      }}
    >
      <Icon size={15} style={{ flexShrink: 0, marginTop: sub ? 2 : 0 }} />
      <div style={{ minWidth: 0 }}>
        <p className="text-sm font-medium" style={{ lineHeight: 1.3 }}>{label}</p>
        {sub && (
          <p style={{ fontSize: 10, lineHeight: 1.3, color: active ? 'var(--accent)' : 'var(--muted)', opacity: 0.7, marginTop: 1 }}>
            {sub}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col shrink-0"
      style={{
        width: 220,
        background: 'var(--card)',
        borderRight: '1px solid var(--card-border)',
        minHeight: '100vh',
        padding: '24px 12px 16px',
      }}>

      {/* Brand */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: 'var(--accent)', color: '#0d1b2a' }}>T</div>
        <span className="font-bold text-sm">TOEIC Prep</span>
      </div>

      <nav className="flex-1 flex flex-col">

        <NavItem href="/dashboard" label={t.nav.dashboard} icon={LayoutDashboard} exact />

        <SectionLabel label={t.nav.sectionPractice} />

        <NavItem href="/listening" label="Listening" sub="Parts 1–4" icon={Headphones} />
        <NavItem href="/reading" label="Reading" sub="Parts 5–7" icon={BookOpen} />
        <NavItem href="/speaking" label="Speaking" sub="Mündlich" icon={Mic} />
        <NavItem href="/writing" label="Writing" sub="Schriftlich" icon={PenLine} />

        <SectionLabel label={t.nav.sectionInfo} />
        <NavItem href="/diagnostic" label={t.nav.diagnostic} sub={t.nav.diagnosticSub} icon={Zap} />
        <NavItem href="/progress" label={t.nav.progress} icon={BarChart2} />
        <NavItem href="/guide" label={t.nav.guide} icon={Info} />

      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 px-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          <LogOut size={15} />
          {t.nav.signOut}
        </button>
      </div>
    </aside>
  )
}
