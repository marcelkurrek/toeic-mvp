import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { CheckCircle2, Circle, Clock, Zap } from 'lucide-react'

type Status = 'done' | 'in-progress' | 'planned'
type Priority = 'hoch' | 'mittel' | 'niedrig'

interface Task {
  title: string
  desc: string
  status: Status
  priority: Priority
  category: string
}

const TASKS: Task[] = [
  // ── Core App ──────────────────────────────────────────────────────────────
  { title: 'Authentifizierung (Login / Register)', desc: 'Supabase Auth mit E-Mail & Passwort, Passwort-Reset', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Onboarding', desc: 'Prüfungstyp & Datum wählen nach Registrierung', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Einstufungstest (Diagnostic)', desc: 'CEFR-Niveau für alle 4 Skills ermitteln', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 5', desc: 'Grammatik & Wortschatz — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 6', desc: 'Textergänzung — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 7', desc: 'Leseverständnis — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Fortschritt-Seite', desc: 'Genauigkeit nach Part, Sitzungsverlauf', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'TOEIC Guide', desc: 'Testformat, FAQ, Vorbereitung, Scoring', status: 'done', priority: 'mittel', category: 'Core' },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  { title: 'Dashboard Übersicht', desc: 'Stats, CEFR-Level, Empfehlung, letzte Aktivität', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Dashboard API', desc: 'GET /api/dashboard — aggregierter Endpunkt', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Streak-Tracking', desc: 'Aktuelle & längste Lernserie berechnen und anzeigen', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Wöchentliche Aktivitäts-Heatmap', desc: '7-Tage-Kalender mit täglicher Sitzungsanzahl', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Lernziel setzen', desc: 'Ziel-Score eingeben, Fortschritt zum Ziel anzeigen', status: 'planned', priority: 'niedrig', category: 'Dashboard' },

  // ── Admin ─────────────────────────────────────────────────────────────────
  { title: 'Admin-Bereich', desc: 'Geschützter Bereich mit ADMIN_EMAILS Env-Variable', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Nutzer-Übersicht', desc: 'Alle Nutzer mit CEFR, Sitzungen, Prüfungstyp', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Fragen-Datenbank', desc: 'Aufschlüsselung nach Section und Part', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Sitzungen', desc: 'Letzte 20 abgeschlossene Sitzungen', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Action Plan', desc: 'Diese Seite — Roadmap mit Status-Tracking', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Nutzer-Detail', desc: 'Einzelansicht pro Nutzer mit vollständiger History', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Fragen-Editor', desc: 'Neue Fragen anlegen, bearbeiten, löschen', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Export (CSV)', desc: 'Nutzer- und Sitzungsdaten als CSV exportieren', status: 'done', priority: 'niedrig', category: 'Admin' },

  // ── User Settings ─────────────────────────────────────────────────────────
  { title: 'Nutzer-Einstellungen', desc: 'Name, Prüfungstyp und Datum ändern', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Sprachumschalter', desc: 'Deutsch / Englisch wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Theme-Switcher', desc: 'Hell / Dunkel wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Account löschen', desc: 'Nutzer kann Konto und Daten dauerhaft löschen', status: 'done', priority: 'niedrig', category: 'Settings' },

  // ── AI Features ───────────────────────────────────────────────────────────
  { title: 'AI Writing-Feedback', desc: 'Anthropic Claude bewertet Essay und E-Mail', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'AI Speech-Feedback', desc: 'Transcript-Bewertung für Speaking-Aufgaben', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'Adaptive Fragen-Auswahl', desc: 'Schwierigkeitsgrad automatisch anpassen basierend auf Leistung', status: 'planned', priority: 'hoch', category: 'AI' },
  { title: 'AI Study Plan', desc: 'Personalisierter Wochenplan basierend auf CEFR und Prüfungsdatum', status: 'done', priority: 'mittel', category: 'AI' },

  // ── Infrastructure ────────────────────────────────────────────────────────
  { title: 'Middleware Auth-Schutz', desc: 'Alle App-Routen erfordern Authentifizierung', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Prisma Schema & Migrations', desc: 'Vollständiges Datenmodell für alle Entitäten', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Seed-Daten', desc: 'Fragen-Datenbank initial befüllen', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Rate Limiting', desc: 'API-Endpunkte gegen Missbrauch schützen', status: 'done', priority: 'mittel', category: 'Infra' },
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports', status: 'planned', priority: 'niedrig', category: 'Infra' },
]

const STATUS_CONFIG = {
  done:        { label: 'Fertig',       icon: CheckCircle2, color: 'var(--success)',  bg: 'rgba(74,222,128,0.12)' },
  'in-progress': { label: 'In Arbeit',  icon: Zap,          color: '#fbbf24',         bg: 'rgba(251,191,36,0.12)' },
  planned:     { label: 'Geplant',      icon: Circle,       color: 'var(--muted)',    bg: 'var(--card-border)' },
}

const PRIORITY_COLORS = {
  hoch:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  mittel:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  niedrig: { color: 'var(--muted)', bg: 'var(--card-border)' },
}

const CATEGORIES = ['Core', 'Dashboard', 'Admin', 'Settings', 'AI', 'Infra']

export default async function AdminActionPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const done       = TASKS.filter(t => t.status === 'done').length
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length
  const planned    = TASKS.filter(t => t.status === 'planned').length
  const total      = TASKS.length
  const pct        = Math.round(done / total * 100)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Action Plan</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Produktroadmap — Implementierungsstand</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Gesamt', value: total, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
          { label: 'Fertig', value: done, color: 'var(--success)', bg: 'rgba(74,222,128,0.12)' },
          { label: 'In Arbeit', value: inProgress, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
          { label: 'Geplant', value: planned, color: 'var(--muted)', bg: 'var(--card-border)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 8 }}>{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p className="font-semibold text-sm">Gesamtfortschritt</p>
          <p className="font-bold text-xl" style={{ color: 'var(--success)' }}>{pct}%</p>
        </div>
        <div style={{ height: 10, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--success)', width: `${pct}%`, transition: 'width 0.5s' }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>{done} von {total} Features implementiert</p>
      </div>

      {/* Tasks by category */}
      {CATEGORIES.map(category => {
        const tasks = TASKS.filter(t => t.category === category)
        if (tasks.length === 0) return null
        const catDone = tasks.filter(t => t.status === 'done').length
        return (
          <div key={category} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h2 className="text-base font-semibold">{category}</h2>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{catDone}/{tasks.length} fertig</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(task => {
                const s = STATUS_CONFIG[task.status]
                const p = PRIORITY_COLORS[task.priority]
                const Icon = s.icon
                return (
                  <div key={task.title} className="card" style={{
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    opacity: task.status === 'planned' ? 0.7 : 1,
                  }}>
                    <Icon size={18} style={{ color: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-medium text-sm" style={{ marginBottom: 2 }}>{task.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{task.desc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.bg, color: p.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
