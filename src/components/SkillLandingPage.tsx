'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Zap, Check } from 'lucide-react'

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
  const [selected, setSelected] = useState<Set<string>>(new Set(tasks.map(t => t.id)))

  const allSelected = selected.size === tasks.length
  const noneSelected = selected.size === 0

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleStart() {
    if (noneSelected) return
    const chosen = tasks.filter(t => selected.has(t.id))
    if (chosen.length === 1) {
      router.push(chosen[0].href)
      return
    }
    const [first, ...rest] = chosen
    const nextParam = rest.map(t => t.href).join(',')
    router.push(`${first.href}?next=${encodeURIComponent(nextParam)}`)
  }

  const startLabel = noneSelected
    ? 'Auswahl treffen'
    : allSelected
      ? 'Alle starten'
      : selected.size === 1
        ? `${tasks.find(t => selected.has(t.id))?.label} starten`
        : `${selected.size} Parts starten`

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-4" style={{ marginBottom: 32 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: color + '20', color }}>
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{description}</p>
        </div>
      </div>

      {/* Part selection card */}
      <div className="card" style={{ padding: '24px 24px 20px', marginBottom: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <p className="font-semibold">Übungen auswählen</p>
          <button
            onClick={() => setSelected(allSelected ? new Set() : new Set(tasks.map(t => t.id)))}
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: 'var(--card-border)', color: 'var(--muted)' }}
          >
            {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: tasks.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}>
          {tasks.map(t => {
            const isSelected = selected.has(t.id)
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all border"
                style={{
                  borderColor: isSelected ? color : 'var(--card-border)',
                  background: isSelected ? color + '12' : 'transparent',
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: isSelected ? color : 'transparent',
                    border: isSelected ? 'none' : '2px solid var(--card-border)',
                  }}
                >
                  {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: isSelected ? color : 'var(--foreground)' }}>
                    {t.label}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 1 }}>{t.sub}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleStart}
          disabled={noneSelected}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ height: 48, fontSize: 15, opacity: noneSelected ? 0.4 : 1, cursor: noneSelected ? 'not-allowed' : 'pointer' }}
        >
          <Play size={16} />
          {startLabel}
        </button>
      </div>

      {/* Diagnostic recommendation */}
      <button
        onClick={() => router.push('/diagnostic')}
        className="card p-5 text-left w-full transition-all hover:scale-[1.005]"
        style={{
          background: hasDiagnostic ? 'var(--green-subtle)' : 'var(--card)',
          border: hasDiagnostic ? '1px solid rgba(74,222,128,0.4)' : '1px solid var(--card-border)',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: hasDiagnostic ? 'rgba(74,222,128,0.15)' : 'var(--orange-subtle)',
              color: hasDiagnostic ? 'var(--success)' : 'var(--orange)',
            }}>
            <Zap size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {hasDiagnostic ? 'Empfohlene Aufgaben' : 'Einstufungstest zuerst'}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              {hasDiagnostic
                ? 'Auf Basis deines Einstufungstests empfehlen wir dir passende Übungen.'
                : 'Mache den Einstufungstest für personalisierte Empfehlungen.'}
            </p>
          </div>
          {!hasDiagnostic && (
            <span className="ml-auto text-xs font-semibold shrink-0" style={{ color: 'var(--orange)' }}>
              Starten →
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
