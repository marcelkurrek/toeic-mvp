'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, LogOut, BookOpenCheck, GraduationCap, Settings, ShieldAlert, Trophy } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
    activeFor: [] as string[],
  },
  {
    href: '/achievements',
    label: 'Achievements',
    icon: Trophy,
    exact: true,
    activeFor: [] as string[],
  },
  {
    href: '/test-training',
    label: 'Üben',
    icon: BookOpenCheck,
    exact: false,
    activeFor: ['/listening', '/reading', '/speaking', '/writing', '/progress', '/study-plan'],
  },
  {
    href: '/test-simulation',
    label: 'Prüfen',
    icon: GraduationCap,
    exact: false,
    activeFor: ['/practice', '/diagnostic', '/guide'],
  },
  {
    href: '/settings',
    label: 'Einstellungen',
    icon: Settings,
    exact: true,
    activeFor: [] as string[],
  },
]

function NavItem({
  href, label, icon: Icon, exact, activeFor,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact: boolean
  activeFor: string[]
}) {
  const pathname = usePathname()
  const selfActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const childActive = activeFor.some(p => pathname === p || pathname.startsWith(p + '/'))
  const active = selfActive || childActive

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg transition-all duration-150"
      style={{
        padding: '10px 12px',
        marginBottom: '2px',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: active ? '#ffffff' : 'var(--muted)',
        textDecoration: 'none',
        borderLeft: active ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.6, transition: 'opacity 0.15s' }} />
      <p style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</p>
    </Link>
  )
}

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
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
        width: 210,
        background: 'var(--card)',
        borderRight: '1px solid var(--card-border)',
        minHeight: '100vh',
        padding: '20px 8px 16px',
      }}>

      {/* Brand */}
      <div style={{ padding: '4px 12px 18px', borderBottom: '1px solid var(--card-border)', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 12, color: '#fff',
            boxShadow: '0 2px 8px rgba(27,82,245,0.3)',
            flexShrink: 0,
          }}>T</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>TOEIC Prep</p>
            <p style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.04em' }}>Exam Training</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0">
        {NAV.map(item => (
          <NavItem key={item.href} {...item} />
        ))}

        {isAdmin && (
          <>
            <div style={{ height: 1, background: 'var(--card-border)', margin: '12px 4px' }} />
            <NavItem href="/admin" label="Admin" icon={ShieldAlert} exact activeFor={[]} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', marginBottom: 2 }}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg transition-all duration-150"
          style={{
            padding: '8px 12px',
            color: 'var(--muted)',
            background: 'none', border: 'none',
            cursor: 'pointer', width: '100%', textAlign: 'left',
            fontSize: 13, fontWeight: 500,
          }}
        >
          <LogOut size={14} />
          {t.nav.signOut}
        </button>
      </div>
    </aside>
  )
}
