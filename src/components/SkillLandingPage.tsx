'use client'
import { useRouter } from 'next/navigation'
import { Zap, List, Sparkles, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/i18n/client'

interface Task {
  id: string
  label: string
  sub: string
  href: string
  part?: number
}

interface SkillLandingPageProps {
  skill: 'listening' | 'reading' | 'speaking' | 'writing'
  title: string
  description: string
  color: string
  icon: React.ReactNode
  tasks: Task[]
  hasDiagnostic: boolean
  partAccuracy?: Record<number, { accuracy: number; sampleSize: number }>
}

export default function SkillLandingPage({
  title,
  description,
  color,
  icon,
  tasks,
  hasDiagnostic,
  partAccuracy,
}: SkillLandingPageProps) {
  const router = useRouter()
  const { lang } = useLang()
  const isDE = lang === 'de'
  void icon

  const UI = {
    chooseTasks:      isDE ? 'Aufgaben wählen'                                         : 'Choose task',
    notPracticed:     isDE ? 'Noch nicht geübt'                                        : 'Not practiced yet',
    questionsAnswered: isDE ? 'Fragen beantwortet'                                     : 'questions answered',
    startAll:         isDE ? 'Alle Aufgaben starten'                                   : 'Start all tasks',
    startAllSub:      isDE ? 'Von oben nach unten alle verfügbaren Aufgaben durcharbeiten' : 'Work through all available tasks from top to bottom',
    adaptive:         isDE ? 'Adaptives Training'                                      : 'Adaptive training',
    adaptiveSub:      isDE ? 'Fragen werden automatisch an dein Niveau angepasst'      : 'Questions are automatically adjusted to your level',
    dodiagnostic:     isDE ? 'Einstufungstest zuerst'                                  : 'Take the placement test first',
    dodiagnosticSub:  isDE ? 'Starte mit dem Einstufungstest für personalisierte Empfehlungen' : 'Start with the placement test for personalized recommendations',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 4 }}>{title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{description}</p>
      </div>

      {/* Per-part cards */}
      {tasks.length > 0 && (
        <>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            {UI.chooseTasks}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {tasks.map(task => {
              const prog = task.part !== undefined ? partAccuracy?.[task.part] : undefined
              const pct  = prog ? Math.round(prog.accuracy * 100) : null
              const pctColor = pct === null ? 'var(--muted)' : pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : '#ef4444'
              return (
                <button
                  key={task.id}
                  onClick={() => router.push(task.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    borderRadius: 12, border: `1.5px solid var(--card-border)`,
                    background: 'var(--card)', cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color + '60')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{task.label}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-medium text-sm" style={{ marginBottom: 2 }}>{task.sub}</p>
                    {pct !== null && prog ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 99, background: pctColor, width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: pctColor, flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--muted)' }}>{prog.sampleSize} {UI.questionsAnswered}</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{UI.notPracticed}</p>
                    )}
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Quick options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Start all */}
        <button
          onClick={() => router.push(tasks[0].href)}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
            borderRadius: 12, border: `1.5px solid ${color}40`,
            background: color + '08', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <List size={18} style={{ color }} />
          </div>
          <div>
            <p className="font-semibold text-sm">{UI.startAll}</p>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{UI.startAllSub}</p>
          </div>
          <ChevronRight size={15} style={{ color, flexShrink: 0, marginLeft: 'auto' }} />
        </button>

        {/* Adaptive / Diagnostic */}
        <button
          onClick={() => router.push(hasDiagnostic ? tasks[0].href + '?adaptive=true' : '/diagnostic')}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
            borderRadius: 12, border: `1.5px solid var(--card-border)`,
            background: 'var(--card)', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: hasDiagnostic ? 'var(--accent-subtle)' : 'rgba(251,146,60,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {hasDiagnostic ? <Sparkles size={18} style={{ color: 'var(--accent)' }} /> : <Zap size={18} style={{ color: '#fb923c' }} />}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {hasDiagnostic ? UI.adaptive : UI.dodiagnostic}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
              {hasDiagnostic ? UI.adaptiveSub : UI.dodiagnosticSub}
            </p>
          </div>
          <ChevronRight size={15} style={{ color: 'var(--muted)', flexShrink: 0, marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  )
}
