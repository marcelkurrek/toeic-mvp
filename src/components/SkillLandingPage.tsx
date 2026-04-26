'use client'
import { useRouter } from 'next/navigation'
import { Zap, List, Sparkles } from 'lucide-react'

interface Task {
  id: string
  label: string
  sub: string
  href: string
}

interface SkillLandingPageProps {
  skill: 'listening' | 'reading' | 'speaking' | 'writing'
  title: string
  description: string
  color: string
  icon: React.ReactNode
  tasks: Task[]
  hasDiagnostic: boolean
}

export default function SkillLandingPage({
  title,
  description,
  color,
  icon,
  tasks,
  hasDiagnostic,
}: SkillLandingPageProps) {
  const router = useRouter()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: color + '20', color }}>
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p style={{ color: 'var(--muted)' }}>{description}</p>
        </div>
      </div>

      {/* 3 Options */}
      <div className="flex flex-col gap-4">

        {/* Option 1: Alle Aufgaben */}
        <button
          onClick={() => router.push(tasks[0].href)}
          className="card p-6 text-left transition-all hover:scale-[1.01]"
          style={{ borderColor: color + '40', cursor: 'pointer', background: 'var(--card)', border: `1px solid ${color}40` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + '20', color }}>
              <List size={20} />
            </div>
            <div>
              <p className="font-semibold text-base mb-1">Alle Aufgaben</p>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Gehe alle verfügbaren Aufgaben durch — von Anfang bis Ende.
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {tasks.map(t => (
                  <span key={t.id}
                    onClick={e => { e.stopPropagation(); router.push(t.href) }}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                    style={{ background: color + '20', color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>

        {/* Option 2: Aufgaben wählen */}
        <div className="card p-6" style={{ background: 'var(--card)' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base mb-1">Aufgaben wählen</p>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
                Wähle gezielt welche Übungen du machen möchtest.
              </p>
              <div className="flex gap-3 flex-wrap">
                {tasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => router.push(t.href)}
                    className="card px-4 py-3 text-left transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--card)', minWidth: 140 }}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Empfohlen */}
        <button
          onClick={() => router.push('/diagnostic')}
          className="card p-6 text-left transition-all hover:scale-[1.01]"
          style={{ background: hasDiagnostic ? 'var(--green-subtle)' : 'var(--card)', border: hasDiagnostic ? '1px solid var(--green)40' : undefined, cursor: 'pointer' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: hasDiagnostic ? 'var(--green-subtle)' : 'var(--orange-subtle)', color: hasDiagnostic ? 'var(--green)' : 'var(--orange)' }}>
              <Zap size={20} />
            </div>
            <div>
              <p className="font-semibold text-base mb-1">
                {hasDiagnostic ? 'Empfohlene Aufgaben' : 'Einstufungstest zuerst'}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                {hasDiagnostic
                  ? 'Auf Basis deines Einstufungstests zeigen wir dir die Aufgaben, die dir am meisten bringen.'
                  : 'Mache zuerst den Einstufungstest, damit wir dir passende Aufgaben empfehlen können.'}
              </p>
              {!hasDiagnostic && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'var(--orange-subtle)', color: 'var(--orange)' }}>
                  Einstufungstest starten →
                </span>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
