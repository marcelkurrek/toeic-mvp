'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, LogOut, Info, Zap, Headphones, BookOpen, Mic, PenLine, Settings, CalendarDays, Trophy, ClipboardList, ShieldAlert } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      color: 'var(--muted)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      fontSize: 9,
      fontWeight: 700,
      padding: '20px 12px 6px',
    }}>
      {label}
    </p>
  )
}

function NavItem({
  href, label, sub, icon: Icon, exact = false, color,
}: {
  href: string
  label: string
  sub?: string
  icon: React.ElementType
  exact?: boolean
  color?: string
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const accentColor = color ?? 'rgba(255,255,255,0.85)'

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg transition-all duration-150"
      style={{
        padding: '9px 10px 9px 10px',
        marginBottom: '1px',
        position: 'relative',
        background: active ? `${accentColor}12` : 'transparent',
        color: active ? '#ffffff' : 'var(--muted)',
        textDecoration: 'none',
        borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
      }}
    >
      <Icon
        size={15}
        style={{
          flexShrink: 0,
          color: active ? accentColor : 'inherit',
          transition: 'color 0.15s',
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: active ? 600 : 500, lineHeight: 1.3 }}>
          {label}
        </p>
        {sub && (
          <p style={{
            fontSize: 10,
            lineHeight: 1.3,
            marginTop: 1,
            color: active ? `${accentColor}99` : 'var(--muted)',
            opacity: active ? 1 : 0.7,
          }}>
            {sub}
          </p>
        )}
      </div>
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
        width: 220,
        background: 'var(--card)',
        borderRight: '1px solid var(--card-border)',
        minHeight: '100vh',
        padding: '20px 8px 16px',
      }}>

      {/* Brand */}
      <div style={{ padding: '4px 12px 20px', borderBottom: '1px solid var(--card-border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, color: '#fff',
            boxShadow: '0 2px 10px rgba(27,82,245,0.35)',
            flexShrink: 0,
          }}>T</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>TOEIC Prep</p>
            <p style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.04em' }}>Exam Training</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col">

        <NavItem href="/dashboard" label={t.nav.dashboard} icon={LayoutDashboard} exact />

        <SectionLabel label={t.nav.sectionPractice} />

        <NavItem href="/listening" label="Listening" sub="Parts 1–4" icon={Headphones} color="#04FF88" />
        <NavItem href="/reading"   label="Reading"   sub="Parts 5–7" icon={BookOpen}   color="#D5FD44" />
        <NavItem href="/speaking"  label="Speaking"  sub="Mündlich"  icon={Mic}        color="#fb923c" />
        <NavItem href="/writing"   label="Writing"   sub="Schriftlich" icon={PenLine}  color="#AE00FF" />

        <SectionLabel label={t.nav.sectionInfo} />

        <NavItem href="/diagnostic"       label={t.nav.diagnostic} sub={t.nav.diagnosticSub} icon={Zap} />
        <NavItem href="/progress"         label={t.nav.progress}   icon={BarChart2} />
        <NavItem href="/study-plan"       label="Lernplan"         sub="Wochenplan"           icon={CalendarDays} />
        <NavItem href="/achievements"     label="Achievements"     sub="Abzeichen"            icon={Trophy} />
        <NavItem href="/practice/mini-exam" label="Mini-Prüfung"  sub="15 Min · 11 Fragen"   icon={ClipboardList} />
        <NavItem href="/guide"            label={t.nav.guide}      icon={Info} />
        <NavItem href="/settings"         label="Einstellungen"    icon={Settings} />

        {isAdmin && (
          <>
            <SectionLabel label="Admin" />
            <NavItem href="/admin" label="Admin-Bereich" sub="Verwaltung" icon={ShieldAlert} color="#ef4444" exact />
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
            padding: '9px 10px',
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
