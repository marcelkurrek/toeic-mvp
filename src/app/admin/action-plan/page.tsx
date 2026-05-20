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
  { title: 'Vercel Deployment', desc: 'Repo mit Vercel verbinden — jeder Push auf main löst automatisches Deployment aus, Änderungen sofort im Browser sichtbar ohne git pull oder Dev-Server', status: 'planned', priority: 'hoch', category: 'Infra' },
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports via Resend', status: 'planned', priority: 'niedrig', category: 'Infra' },

  // ── In Arbeit ──────────────────────────────────────────────────────────────
  { title: 'Listening Shell (TTS-basiert)', desc: 'AudioPlayer-Komponente mit Web-Speech-API TTS, Single-Play-Enforcement, Transcript-Toggle nach Antwort', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 1 – Fotos', desc: '6 Fragen: Foto zeigen + 4 Aussagen per TTS abspielen → MCQ. Einmal abspielbar wie echte Prüfung', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 2 – Frage & Antwort', desc: '25 Fragen: Frage per TTS + 3 Antwortoptionen per TTS. Keine Optionen sichtbar während Audio läuft (wie echte Prüfung)', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 3 – Gespräche', desc: '13 Gespräche × 3 Fragen. Dialog per TTS → Fragen erscheinen erst NACH Audio (richtiger Prüfungsablauf)', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 4 – Monologe', desc: '10 Monologe × 3 Fragen. Ansage per TTS → Fragen erst nach Audio. Grafik-Support (Tabelle/Zeitplan)', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Writing Shell', desc: 'Textarea mit Live-Wortzähler, Timer pro Aufgabe, Keyword-Anzeige (Task 1), AI-Feedback via Claude API', status: 'in-progress', priority: 'hoch', category: 'Core' },
  { title: 'Seed-Daten Ausbauen', desc: 'Part 5: 10→60 Fragen (alle 15 Grammatikmuster), Part 6: 4→20 Texte, Part 7: +10 Passagen-Sets, Part 2: 25 originale Q&A-Paare', status: 'in-progress', priority: 'hoch', category: 'Infra' },
  { title: 'Daily Mission / Guided Path', desc: 'Dashboard zeigt tägl. Lernmission (welche Parts, wie viele Fragen). Ein Klick startet automatisch. Kein manuelles Navigieren nötig', status: 'in-progress', priority: 'hoch', category: 'Dashboard' },

  // ── Geplant ───────────────────────────────────────────────────────────────
  { title: 'Vercel Deployment', desc: 'Repo mit Vercel verbinden — jeder Push auf main löst automatisches Deployment aus, Änderungen sofort im Browser sichtbar ohne git pull oder Dev-Server', status: 'planned', priority: 'hoch', category: 'Infra' },
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports via Resend', status: 'planned', priority: 'niedrig', category: 'Infra' },
  { title: 'Score-Modell L+R getrennt', desc: 'Listening-Score (5–495) und Reading-Score (5–495) separat berechnen und anzeigen statt Gesamt-Accuracy. Näherungskonversion basierend auf ETS-Tabellen', status: 'planned', priority: 'hoch', category: 'Dashboard' },
  { title: 'Part 7 Multi-Passage Split-View', desc: 'Doppel- und Dreifach-Passagen nebeneinander anzeigen. Emails als Email formatiert, Tabellen als Tabelle. NOT-Fragen-Typ visuell markieren', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Speaking Tasks 4–5', desc: 'Task 4: Fragen zu einem Dokument beantworten (requires Grafik-Rendering). Task 5: Meinung äußern (60 Sek, offene Aufgabe)', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Speaking: 5 Bewertungsdimensionen', desc: 'Claude bewertet Aussprache, Intonation, Flüssigkeit, Grammatik/Vokabular, Aufgabenerfüllung separat statt eine Gesamtzahl', status: 'planned', priority: 'mittel', category: 'AI' },
  { title: 'Onboarding Flow', desc: 'Nach Registrierung: Name → Prüfungstyp → Zieldatum → Ziel-Score → Kurzdiagnostik → Erster Tagesplan. Kein manuelles Navigieren', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Flow Logic: Automatischer Tagesplan', desc: 'Regelbasierte Engine: Wenn Part X < 60% → tägl. priorisieren. Wenn exam_date < 14d → Simulation fokus. Claude analysiert Fehlermuster nach Session', status: 'planned', priority: 'hoch', category: 'AI' },
  { title: 'Grammar Pattern Tagging', desc: 'Alle Part-5-Fragen mit Grammatikmuster-Tags (verb-form, preposition, connector, etc.). Fehleranalyse: "Du machst Präpositions-Fragen 3× häufiger falsch"', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Part 3/4 Grafik-Rendering', desc: 'Tabellen, Zeitpläne, Preislisten aus JSON als HTML-Tabelle neben Audio-Player anzeigen. Für Part 3 "look at the graphic" Fragen', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Score-Verlaufs-Chart', desc: 'Liniendiagramm des geschätzten L+R Scores über die letzten 30 Tage. Motivierendste Visualisierung laut Nutzerforschung', status: 'planned', priority: 'mittel', category: 'Dashboard' },
  { title: 'Part 2 Ablauf korrigieren', desc: 'Antwortoptionen sind im echten Test NICHT sichtbar während Audio läuft — erst nach Abspielen erscheinen die Optionen auf dem Bildschirm', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Transcript-Toggle nach Listening', desc: 'Nach Beantwortung: Transkript anzeigen mit falsch/richtig markierten Aussagen. Wichtig für Lerneffekt', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Vollprüfungs-Simulation (200 Fragen)', desc: '120 Min echte Prüfung: 45 Min Listening automatisch (kein Skip), dann 75 Min Reading selbstgesteuert. Echter Prüfungsablauf 1:1', status: 'planned', priority: 'hoch', category: 'Practice' },
  { title: 'Mini-Exam: Listening einbinden', desc: 'Mini-Prüfung aktuell nur Reading. Listening-Fragen (Part 1-4 je 2) hinzufügen für gemischte 20-Min-Simulation', status: 'planned', priority: 'mittel', category: 'Practice' },

  // ── Ideen (warten auf Validierung) ────────────────────────────────────────
  { title: 'Vokabel-System mit Spaced Repetition', desc: '1000+ TOEIC-Vokabeln kategorisiert nach Domäne (Finance, HR, Travel, Marketing, Office). SM-2 Algorithmus für Wiederholungsintervalle. Forschung zeigt direkten Score-Zusammenhang', status: 'idea', priority: 'hoch', category: 'Practice' },
  { title: 'Score-Prognose auf Prüfungstag', desc: 'Lineare Regression über Accuracy-Verlauf → "Bei aktueller Lernrate erreichst du voraussichtlich 720–760 am [Datum]". Warnung wenn Ziel nicht erreichbar', status: 'idea', priority: 'mittel', category: 'Dashboard' },
  { title: 'PWA / Offline-Modus', desc: 'Service Worker + PWA-Manifest für Home-Screen-Installation. Fragen offline cachen. Push Notifications für Streak-Schutz. Wichtig für mobile TOEIC-Märkte (Japan, Korea)', status: 'idea', priority: 'mittel', category: 'Infra' },
  { title: 'B2B: Team-Management', desc: 'Lehrer/HR-Manager erstellt Kurs, weist Studenten zu, sieht aggregierten Fortschritt. PDF-Reports pro Schüler. Größter Umsatzhebel laut ETS-Statistiken', status: 'idea', priority: 'mittel', category: 'Core' },
  { title: 'Speaking Full Practice', desc: 'Alle 5 Task-Typen (Read Aloud, Describe Picture, Respond, Express Opinion) mit AI-Bewertung', status: 'idea', priority: 'hoch', category: 'Core' },
  { title: 'TOEIC Score-Schätzer', desc: 'Rechner der aus Übungs-Genauigkeit einen geschätzten TOEIC-Score (0–990) berechnet', status: 'idea', priority: 'mittel', category: 'Dashboard' },
  { title: 'Streak Freeze', desc: 'Nutzer kann 1× pro Woche einen verpassten Tag "einfrieren" ohne die Streak zu verlieren', status: 'idea', priority: 'niedrig', category: 'Practice' },
  { title: 'Fortschritts-Report PDF', desc: 'Detaillierter PDF-Export mit CEFR-Verlauf, Genauigkeit pro Part, Achievements', status: 'idea', priority: 'niedrig', category: 'Settings' },
  { title: 'Admin: KPI-Dashboard', desc: 'Tägl. aktive Nutzer, Retention-Kurve, beliebteste Parts — Übersicht für Produktentscheidungen', status: 'idea', priority: 'mittel', category: 'Admin' },
  { title: 'Onboarding-Tutorial', desc: 'Interaktiver Schritt-für-Schritt-Guide beim ersten Login — zeigt alle Features', status: 'idea', priority: 'niedrig', category: 'Core' },
  { title: 'Radar-Chart alle 7 Parts', desc: 'Spider-Chart zeigt Performance aller Parts gleichzeitig. Visuell sofort erkennbar wo die Lücken sind', status: 'idea', priority: 'niedrig', category: 'Dashboard' },
  { title: '4 Akzente im Listening', desc: 'Echte TOEIC verwendet American, British, Canadian, Australian English. TTS-Stimmen pro Frage taggen und unterschiedlich konfigurieren', status: 'idea', priority: 'mittel', category: 'Core' },
  { title: 'SCORM / LMS Integration', desc: 'Corporate L&D Teams nutzen Moodle, SAP SuccessFactors. SCORM-Paket ermöglicht Verkauf in Enterprise-LMS ohne deren System zu ersetzen', status: 'idea', priority: 'niedrig', category: 'Infra' },
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
