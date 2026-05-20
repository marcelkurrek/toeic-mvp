import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { CheckCircle2, Circle, Zap, Lightbulb } from 'lucide-react'

type Status = 'done' | 'in-progress' | 'planned' | 'idea'
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
  { title: 'Lernziel setzen', desc: 'Ziel-Score eingeben, Fortschritt zum Ziel anzeigen', status: 'done', priority: 'niedrig', category: 'Dashboard' },
  { title: 'Dashboard Quick-Actions', desc: '3 Schnellzugriff-Cards: Weiter üben, Schwache Parts, Mini-Prüfung', status: 'done', priority: 'mittel', category: 'Dashboard' },

  // ── Admin ─────────────────────────────────────────────────────────────────
  { title: 'Admin-Bereich', desc: 'Geschützter Bereich mit ADMIN_EMAILS Env-Variable', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Nutzer-Übersicht', desc: 'Alle Nutzer mit CEFR, Sitzungen, Prüfungstyp', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Fragen-Datenbank', desc: 'Aufschlüsselung nach Section und Part', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Sitzungen', desc: 'Letzte 20 abgeschlossene Sitzungen', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Action Plan (Kanban)', desc: 'Diese Seite — Roadmap als Kanban-Board mit Ideen-Spalte', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Nutzer-Detail', desc: 'Einzelansicht pro Nutzer mit vollständiger History', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Fragen-Editor', desc: 'Neue Fragen anlegen, bearbeiten, löschen', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Export (CSV)', desc: 'Nutzer- und Sitzungsdaten als CSV exportieren', status: 'done', priority: 'niedrig', category: 'Admin' },
  { title: 'Admin: CSV Fragen-Import', desc: 'Bulk-Upload von Fragen via CSV-Datei', status: 'done', priority: 'mittel', category: 'Admin' },

  // ── User Settings ─────────────────────────────────────────────────────────
  { title: 'Nutzer-Einstellungen', desc: 'Name, Prüfungstyp und Datum ändern', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Sprachumschalter', desc: 'Deutsch / Englisch wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Theme-Switcher', desc: 'Hell / Dunkel wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Account löschen', desc: 'Nutzer kann Konto und Daten dauerhaft löschen', status: 'done', priority: 'niedrig', category: 'Settings' },

  // ── AI Features ───────────────────────────────────────────────────────────
  { title: 'AI Writing-Feedback', desc: 'Anthropic Claude bewertet Essay und E-Mail', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'AI Speech-Feedback', desc: 'Transcript-Bewertung für Speaking-Aufgaben', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'Adaptive Fragen-Auswahl', desc: 'Schwierigkeitsgrad automatisch anpassen basierend auf Leistung', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'AI Study Plan', desc: 'Personalisierter Wochenplan basierend auf CEFR und Prüfungsdatum', status: 'done', priority: 'mittel', category: 'AI' },

  // ── Practice ──────────────────────────────────────────────────────────────
  { title: 'Mini-Exam (Timed Practice)', desc: 'Prüfungssimulation mit Timer — alle Reading Parts in Folge', status: 'done', priority: 'hoch', category: 'Practice' },
  { title: 'Achievements / Meilensteine', desc: 'Badges für Streak, Sitzungsanzahl, Genauigkeit', status: 'done', priority: 'mittel', category: 'Practice' },
  { title: 'Vocabulary Flashcards', desc: 'Wichtige TOEIC-Vokabeln wiederholen (Karteikarten)', status: 'done', priority: 'mittel', category: 'Practice' },
  { title: 'Schwache Parts Analyse', desc: '/practice/weak-parts — priorisiert Parts < 60% Genauigkeit', status: 'done', priority: 'mittel', category: 'Practice' },

  // ── Infrastructure ────────────────────────────────────────────────────────
  { title: 'Middleware Auth-Schutz', desc: 'Alle App-Routen erfordern Authentifizierung', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Prisma Schema & Migrations', desc: 'Vollständiges Datenmodell für alle Entitäten', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Seed-Daten', desc: 'Fragen-Datenbank initial befüllen', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Rate Limiting', desc: 'API-Endpunkte gegen Missbrauch schützen', status: 'done', priority: 'mittel', category: 'Infra' },
  { title: 'Loading Skeletons & Error Boundaries', desc: 'Ladezustände und Fehlerseiten für alle Routen', status: 'done', priority: 'mittel', category: 'Infra' },

  // ── Geplant ───────────────────────────────────────────────────────────────
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports via Resend', status: 'planned', priority: 'niedrig', category: 'Infra' },

  // ── Ideen (warten auf Validierung) ────────────────────────────────────────
  { title: 'Listening Parts 1–4', desc: 'Audio-Player + echte Listening-Fragen für alle 4 Parts; aktuell nur Platzhalter-Seiten', status: 'idea', priority: 'hoch', category: 'Core' },
  { title: 'Speaking Full Practice', desc: 'Alle 5 Task-Typen (Read Aloud, Describe Picture, Respond, Express Opinion) mit AI-Bewertung', status: 'idea', priority: 'hoch', category: 'Core' },
  { title: 'TOEIC Score-Schätzer', desc: 'Rechner der aus Übungs-Genauigkeit einen geschätzten TOEIC-Score (0–990) berechnet', status: 'idea', priority: 'mittel', category: 'Dashboard' },
  { title: 'Streak Freeze', desc: 'Nutzer kann 1× pro Woche einen verpassten Tag "einfrieren" ohne die Streak zu verlieren', status: 'idea', priority: 'niedrig', category: 'Practice' },
  { title: 'Fortschritts-Report PDF', desc: 'Detaillierter PDF-Export mit CEFR-Verlauf, Genauigkeit pro Part, Achievements', status: 'idea', priority: 'niedrig', category: 'Settings' },
  { title: 'Spaced-Repetition Vokabeln', desc: 'SM-2-Algorithmus für Flashcards statt zufälliger Reihenfolge — fällige Karten priorisieren', status: 'idea', priority: 'mittel', category: 'Practice' },
  { title: 'Admin: KPI-Dashboard', desc: 'Tägl. aktive Nutzer, Retention-Kurve, beliebteste Parts — Übersicht für Produktentscheidungen', status: 'idea', priority: 'mittel', category: 'Admin' },
  { title: 'Onboarding-Tutorial', desc: 'Interaktiver Schritt-für-Schritt-Guide beim ersten Login — zeigt alle Features', status: 'idea', priority: 'niedrig', category: 'Core' },
]

const STATUS_CONFIG = {
  idea:        { label: 'Idee',      icon: Lightbulb,     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  planned:     { label: 'Geplant',   icon: Circle,        color: 'var(--muted)', bg: 'var(--card-border)', border: 'var(--card-border)' },
  'in-progress': { label: 'In Arbeit', icon: Zap,         color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  done:        { label: 'Fertig',    icon: CheckCircle2,  color: 'var(--success)', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.2)' },
}

const PRIORITY_COLORS = {
  hoch:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  mittel:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  niedrig: { color: 'var(--muted)', bg: 'var(--card-border)' },
}

const COLUMNS: { status: Status; label: string; hint?: string }[] = [
  { status: 'idea',        label: 'Ideen',     hint: 'Vorschläge zur Validierung' },
  { status: 'planned',     label: 'Geplant',   hint: 'Validiert, noch nicht gestartet' },
  { status: 'in-progress', label: 'In Arbeit', hint: 'Aktuell in Entwicklung' },
  { status: 'done',        label: 'Fertig',    hint: 'Implementiert & deployed' },
]

function TaskCard({ task }: { task: Task }) {
  const p = PRIORITY_COLORS[task.priority]
  const s = STATUS_CONFIG[task.status]
  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${s.border}`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <p className="text-sm font-medium" style={{ lineHeight: 1.4 }}>{task.title}</p>
      <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{task.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: p.bg, color: p.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {task.priority}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {task.category}
        </span>
      </div>
    </div>
  )
}

export default async function AdminActionPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const done       = TASKS.filter(t => t.status === 'done').length
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length
  const planned    = TASKS.filter(t => t.status === 'planned').length
  const ideas      = TASKS.filter(t => t.status === 'idea').length
  const total      = TASKS.filter(t => t.status !== 'idea').length
  const pct        = Math.round(done / total * 100)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Action Plan</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Produktroadmap als Kanban-Board — Ideen validieren, um sie in die Implementierung zu übernehmen</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Ideen', value: ideas, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          { label: 'Geplant', value: planned, color: 'var(--muted)', bg: 'var(--card-border)' },
          { label: 'In Arbeit', value: inProgress, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
          { label: 'Fertig', value: done, color: 'var(--success)', bg: 'rgba(74,222,128,0.1)' },
          { label: 'Fortschritt', value: `${pct}%`, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 6 }}>{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="text-sm font-semibold">Implementierungsfortschritt</p>
          <p className="font-bold" style={{ color: 'var(--success)' }}>{done} / {total} Features</p>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--success)', width: `${pct}%` }} />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const tasks = TASKS.filter(t => t.status === col.status)
          const s = STATUS_CONFIG[col.status]
          const Icon = s.icon
          return (
            <div key={col.status}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                padding: '10px 14px', borderRadius: 10,
                background: s.bg, border: `1px solid ${s.border}`,
              }}>
                <Icon size={14} style={{ color: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm font-semibold" style={{ color: s.color }}>{col.label}</p>
                  {col.hint && <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{col.hint}</p>}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 99, background: s.bg, color: s.color,
                  border: `1px solid ${s.border}`,
                }}>
                  {tasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.length === 0 ? (
                  <div style={{ padding: '20px 14px', textAlign: 'center', borderRadius: 10, border: '1px dashed var(--card-border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>Leer</p>
                  </div>
                ) : (
                  tasks.map(task => <TaskCard key={task.title} task={task} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Idea validation hint */}
      <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 12, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Lightbulb size={15} style={{ color: '#a78bfa' }} />
          <p className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Ideen validieren</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          Ideen in der linken Spalte sind Vorschläge von Claude. Um eine Idee zu implementieren, sage einfach
          &ldquo;Implementiere <em>[Feature-Name]</em>&rdquo; — Claude plant und setzt es automatisch um.
          Um den Status einer Idee auf &ldquo;Geplant&rdquo; oder &ldquo;In Arbeit&rdquo; zu ändern, genügt eine kurze Nachricht.
        </p>
      </div>
    </div>
  )
}
