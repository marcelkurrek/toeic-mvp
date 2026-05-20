'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, BarChart2, LogOut, Zap,
  Headphones, BookOpen, Mic, PenLine,
  Settings, ChevronDown, Layers,
  ClipboardList, ShieldAlert,
} from 'lucide-react'
import { useLang } from '@/lib/i18n/client'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

const SKILLS = [
  { href: '/listening', label: 'Listening', icon: Headphones, color: '#04FF88' },
  { href: '/reading',   label: 'Reading',   icon: BookOpen,   color: '#D5FD44' },
  { href: '/speaking',  label: 'Speaking',  icon: Mic,        color: '#fb923c' },
  { href: '/writing',   label: 'Writing',   icon: PenLine,    color: '#AE00FF' },
]

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      color: 'var(--muted)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      fontSize: 9,
      fontWeight: 700,
      padding: '18px 12px 5px',
    }}>
      {label}
    </p>
  )
}

function NavItem({
  href, label, icon: Icon, exact = false, color, indent = false,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  color?: string
  indent?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const accentColor = color ?? 'rgba(255,255,255,0.85)'

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg transition-all duration-150"
      style={{
        padding: indent ? '7px 10px 7px 14px' : '8px 10px',
        marginBottom: '1px',
        background: active ? `${accentColor}12` : 'transparent',
        color: active ? '#ffffff' : 'var(--muted)',
        textDecoration: 'none',
        borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
      }}
    >
      <Icon
        size={indent ? 13 : 15}
        style={{ flexShrink: 0, color: active ? accentColor : 'inherit', transition: 'color 0.15s' }}
      />
      <p style={{ fontSize: indent ? 12 : 13, fontWeight: active ? 600 : 500, lineHeight: 1.3 }}>
        {label}
      </p>
    </Link>
  )
}

function SkillGroup() {
  const pathname = usePathname()
  const isAnyActive = SKILLS.some(s => pathname === s.href || pathname.startsWith(s.href + '/'))
  const [open, setOpen] = useState(isAnyActive)

  useEffect(() => {
    if (isAnyActive) setOpen(true)
  }, [isAnyActive])

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 rounded-lg transition-all duration-150"
        style={{
          padding: '8px 10px',
          width: '100%',
          background: isAnyActive ? 'rgba(255,255,255,0.05)' : 'transparent',
          border: 'none',
          borderLeft: isAnyActive ? '3px solid rgba(255,255,255,0.3)' : '3px solid transparent',
          color: isAnyActive ? '#fff' : 'var(--muted)',
          cursor: 'pointer',
          marginBottom: '1px',
        }}
      >
        <Layers size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textAlign: 'left' }}>
          Test Training
        </span>
        <ChevronDown
          size={12}
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            opacity: 0.5,
          }}
        />
      </button>

      {open && (
        <div style={{ paddingLeft: 8, marginBottom: 2 }}>
          {SKILLS.map(s => (
            <NavItem key={s.href} href={s.href} label={s.label} icon={s.icon} color={s.color} indent />
          ))}
        </div>
      )}
    </div>
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
      <div style={{ padding: '4px 12px 18px', borderBottom: '1px solid var(--card-border)', marginBottom: 6 }}>
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

      <nav className="flex-1 flex flex-col">

        <NavItem href="/dashboard" label={t.nav.dashboard} icon={LayoutDashboard} exact />

        <SectionLabel label="Vorbereitung" />

        <SkillGroup />
        <NavItem href="/practice/mini-exam" label="Mini-Prüfung" icon={ClipboardList} />
        <NavItem href="/diagnostic" label={t.nav.diagnostic} icon={Zap} />

        <SectionLabel label="Fortschritt" />

        <NavItem href="/progress"     label={t.nav.progress}  icon={BarChart2} />
        <NavItem href="/settings"     label="Einstellungen"   icon={Settings} />

        {isAdmin && (
          <>
            <SectionLabel label="Admin" />
            <NavItem href="/admin" label="Admin" icon={ShieldAlert} color="#ef4444" exact />
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
            padding: '8px 10px',
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
