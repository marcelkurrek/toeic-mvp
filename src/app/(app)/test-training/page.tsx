import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame, Target, Trophy, ChevronRight, Headphones, BookOpen, Mic, PenLine } from 'lucide-react'
import { computeStreak } from '@/lib/streak'
import WeeklyHeatmap from '@/components/WeeklyHeatmap'
import SkillsRadar from '@/components/SkillsRadar'

const SKILLS = [
  { href: '/listening', label: 'Listening', sub: 'Parts 1–4', icon: Headphones, color: '#04FF88', section: 'LISTENING' as const },
  { href: '/reading',   label: 'Reading',   sub: 'Parts 5–7', icon: BookOpen,   color: '#D5FD44', section: 'READING'   as const },
  { href: '/speaking',  label: 'Speaking',  sub: 'Mündlich',  icon: Mic,        color: '#fb923c', section: 'SPEAKING'  as const },
  { href: '/writing',   label: 'Writing',   sub: 'Schriftlich', icon: PenLine,  color: '#AE00FF', section: 'WRITING'   as const },
]

export default async function TestTrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      progress: true,
      sessions: {
        where: { completedAt: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 28,
      },
    },
  })

  const progress = dbUser?.progress ?? []
  const sessions = dbUser?.sessions ?? []
  const streak = computeStreak(sessions.map(s => s.createdAt))
  const totalAnswered = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)
  const overallPct = progress.length
    ? Math.round(progress.reduce((s, p) => s + p.accuracy, 0) / progress.length * 100)
    : null
  const bestPart = progress.length
    ? progress.reduce((best, p) => p.accuracy > best.accuracy ? p : best)
    : null

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Üben</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Gezieltes Training nach Bereich — kein Timer, Feedback nach jeder Frage</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { icon: <Flame size={15} style={{ color: '#fb923c' }} />, bg: 'rgba(251,146,60,0.12)', label: 'Streak', value: streak.current > 0 ? `${streak.current} 🔥` : '0', sub: `Längste: ${streak.longest}d` },
          { icon: <Trophy size={15} style={{ color: '#fbbf24' }} />, bg: 'rgba(251,191,36,0.12)', label: 'Ø Genauigkeit', value: overallPct !== null ? `${overallPct}%` : '—', sub: overallPct !== null ? (overallPct >= 80 ? 'Ausgezeichnet' : overallPct >= 60 ? 'Gut' : 'Weiter üben') : 'Noch keine Daten' },
          { icon: <Target size={15} style={{ color: 'var(--accent)' }} />, bg: 'var(--accent-subtle)', label: 'Fragen beantwortet', value: String(totalAnswered), sub: `${sessions.length} Sitzungen` },
          { icon: <Trophy size={15} style={{ color: '#04FF88' }} />, bg: 'rgba(4,255,136,0.1)', label: 'Bester Part', value: bestPart ? (bestPart.section === 'LISTENING' ? `L · Part ${bestPart.part}` : bestPart.section === 'READING' ? `R · Part ${bestPart.part}` : bestPart.section === 'SPEAKING' ? `SP · Part ${bestPart.part}` : `WR · Part ${bestPart.part}`) : '—', sub: bestPart ? `${Math.round(bestPart.accuracy * 100)}% Genauigkeit` : 'Noch keine Daten' },
        ].map(({ icon, bg, label, value, sub }) => (
          <div key={label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ marginBottom: 3 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {progress.length === 0 && (
        <div style={{ marginBottom: 28, padding: '16px 20px', borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#fbbf24' }}>Einstufungstest noch ausstehend</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Ohne Einstufungstest kann die App dein Training nicht personalisieren.</p>
          </div>
          <a href="/diagnostic" style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, background: '#fbbf24', color: '#0d1b2a', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Jetzt starten
          </a>
        </div>
      )}

      {/* Skill cards */}
      <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
        Bereiche
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {SKILLS.map(skill => {
          const prog = progress.filter(p => p.section === skill.section)
          const avgAcc = prog.length
            ? Math.round(prog.reduce((s, p) => s + p.accuracy, 0) / prog.length * 100)
            : null
          const totalQ = prog.reduce((s, p) => s + (p.sampleSize ?? 0), 0)
          const Icon = skill.icon
          const pctColor = avgAcc === null ? 'var(--muted)' : avgAcc >= 80 ? 'var(--success)' : avgAcc >= 60 ? '#fbbf24' : '#ef4444'

          return (
            <Link
              key={skill.href}
              href={skill.href}
              style={{
                display: 'flex', flexDirection: 'column', gap: 14,
                padding: '20px 20px', borderRadius: 12,
                border: `1.5px solid var(--card-border)`,
                background: 'var(--card)', textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
              className="group"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: skill.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} style={{ color: skill.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{skill.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{skill.sub}</p>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
              </div>

              {avgAcc !== null ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{totalQ} Fragen</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pctColor }}>{avgAcc}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: pctColor, width: `${avgAcc}%` }} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>Noch nicht geübt</p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Skills radar */}
      {(() => {
        const radarSkills = SKILLS.map(skill => {
          const prog = progress.filter(p => p.section === skill.section)
          const avg  = prog.length ? prog.reduce((s, p) => s + p.accuracy, 0) / prog.length : 0
          return { label: skill.label, value: avg, color: skill.color }
        })
        const hasData = radarSkills.some(s => s.value > 0)
        return hasData ? (
          <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Skills-Übersicht</p>
            <SkillsRadar skills={radarSkills} />
          </div>
        ) : null
      })()}

      {/* Activity heatmap */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Aktivität — letzte 4 Wochen</p>
        <WeeklyHeatmap sessionDates={sessions.map(s => s.createdAt.toISOString())} />
      </div>
    </div>
  )
}
