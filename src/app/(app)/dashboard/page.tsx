import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Clock, TrendingUp, Headphones, PenLine, Mic,
  AlertCircle, Zap, ChevronRight, Sparkles, FileEdit, Target,
} from 'lucide-react'
import { getServerTranslations } from '@/lib/i18n/server'

type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'

const SECTION_COLORS: Record<Section, string> = {
  LISTENING: '#22d3ee',
  READING:   '#4ade80',
  SPEAKING:  '#fb923c',
  WRITING:   '#a78bfa',
}
const SECTION_SUBTLES: Record<Section, string> = {
  LISTENING: 'rgba(34,211,238,0.12)',
  READING:   'rgba(74,222,128,0.12)',
  SPEAKING:  'rgba(251,146,60,0.12)',
  WRITING:   'rgba(167,139,250,0.12)',
}
const CEFR_COLORS: Record<string, string> = {
  A1: '#f87171', A2: '#fb923c', B1: '#fbbf24',
  B2: '#4ade80', C1: '#22d3ee', C2: '#a78bfa',
}

const PART_META = [
  { part: 5 as const, href: '/practice/part5', icon: Sparkles, color: '#22d3ee', subtle: 'rgba(34,211,238,0.12)' },
  { part: 6 as const, href: '/practice/part6', icon: FileEdit,  color: '#4ade80', subtle: 'rgba(74,222,128,0.12)' },
  { part: 7 as const, href: '/practice/part7', icon: BookOpen,  color: '#fb923c', subtle: 'rgba(251,146,60,0.12)' },
]

export default async function DashboardPage() {
  const t = await getServerTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      progress: true,
      levels:   true,
      sessions: { orderBy: { createdAt: 'desc' }, take: 5, where: { completedAt: { not: null } } },
    },
  })

  const totalSessions = dbUser?.sessions.length ?? 0
  const avgAccuracy   = dbUser?.progress.length
    ? Math.round(dbUser.progress.reduce((s, p) => s + p.accuracy, 0) / dbUser.progress.length * 100)
    : null
  const daysUntilExam = dbUser?.examDate
    ? Math.ceil((new Date(dbUser.examDate).getTime() - Date.now()) / 86400000)
    : null

  const examType = dbUser?.examType ?? null
  const relevantSections: Section[] = examType === 'LISTENING_READING'
    ? ['LISTENING', 'READING']
    : examType === 'SPEAKING_WRITING'
      ? ['SPEAKING', 'WRITING']
      : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

  const levelMap  = Object.fromEntries((dbUser?.levels ?? []).map(l => [l.section, l]))
  const progByPart = Object.fromEntries((dbUser?.progress ?? []).map(p => [p.part, p]))

  // ── Smart recommendation ──────────────────────────────────────────────────
  type Rec = {
    href: string
    label: string
    partLabel: string
    reason: string
    accuracy: number | null
    cta: string
    color: string
  }

  let recommendation: Rec | null = null

  if (!dbUser?.diagnosticDone) {
    recommendation = {
      href: '/diagnostic',
      label: t.dashboard.recommendation.ctaDiagnostic,
      partLabel: t.nav.diagnostic,
      reason: t.dashboard.recommendation.doDiagnostic,
      accuracy: null,
      cta: t.dashboard.recommendation.ctaDiagnostic,
      color: '#fb923c',
    }
  } else {
    const practicedParts = ([5, 6, 7] as const).filter(p => progByPart[p])
    if (practicedParts.length === 0) {
      recommendation = {
        href: '/practice/part5',
        label: t.dashboard.parts[5].label,
        partLabel: t.dashboard.parts[5].part,
        reason: t.dashboard.recommendation.startFirst,
        accuracy: null,
        cta: t.dashboard.recommendation.ctaPractice,
        color: '#22d3ee',
      }
    } else {
      const weakest = [...practicedParts].sort(
        (a, b) => (progByPart[a]?.accuracy ?? 0) - (progByPart[b]?.accuracy ?? 0)
      )[0]
      const meta = PART_META.find(m => m.part === weakest)!
      recommendation = {
        href: meta.href,
        label: t.dashboard.parts[weakest].label,
        partLabel: t.dashboard.parts[weakest].part,
        reason: practicedParts.every(p => (progByPart[p]?.accuracy ?? 0) >= 0.80)
          ? t.dashboard.recommendation.keepGoing
          : t.dashboard.recommendation.weakest,
        accuracy: progByPart[weakest] ? Math.round(progByPart[weakest].accuracy * 100) : null,
        cta: t.dashboard.recommendation.ctaPractice,
        color: meta.color,
      }
    }
  }

  const firstName = dbUser?.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? ''

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>
          {t.dashboard.greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {daysUntilExam !== null && daysUntilExam > 0
            ? `${t.dashboard.stats.daysToExam}: noch ${daysUntilExam} Tage`
            : daysUntilExam === 0
              ? t.dashboard.stats.examToday
              : t.dashboard.readyToPractice}
        </p>
      </div>

      {/* ── Diagnostic banner ──────────────────────────────────────────── */}
      {!dbUser?.diagnosticDone && (
        <div style={{
          padding: '18px 22px', marginBottom: 24, borderRadius: 12,
          border: '1px solid rgba(251,146,60,0.4)',
          background: 'rgba(251,146,60,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={18} style={{ color: '#fb923c', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="font-semibold text-sm" style={{ marginBottom: 3 }}>{t.dashboard.diagnosticBanner.title}</p>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{t.dashboard.diagnosticBanner.desc}</p>
            </div>
          </div>
          <Link href="/diagnostic" className="btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: 13 }}>
            {t.dashboard.diagnosticBanner.cta}
          </Link>
        </div>
      )}

      {/* ── TODAY'S RECOMMENDATION ─────────────────────────────────────── */}
      {recommendation && (
        <Link href={recommendation.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 28 }}>
          <div style={{
            padding: '22px 26px',
            borderRadius: 14,
            background: `linear-gradient(135deg, ${recommendation.color}18 0%, ${recommendation.color}08 100%)`,
            border: `1px solid ${recommendation.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            transition: 'border-color 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${recommendation.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Target size={22} style={{ color: recommendation.color }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: recommendation.color, marginBottom: 3 }}>
                  {t.dashboard.recommendation.heading}
                </p>
                <p className="font-bold" style={{ fontSize: 16, marginBottom: 4 }}>{recommendation.label}</p>
                <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5, maxWidth: 480 }}>
                  {recommendation.reason}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              {recommendation.accuracy !== null && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    {t.dashboard.recommendation.accuracyLabel}
                  </p>
                  <p className="font-bold text-xl" style={{
                    color: recommendation.accuracy >= 80 ? 'var(--success)' : recommendation.accuracy >= 60 ? '#fbbf24' : 'var(--error)',
                  }}>
                    {recommendation.accuracy}%
                  </p>
                </div>
              )}
              <div className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 18px' }}>
                {recommendation.cta} <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          {
            icon: <BookOpen size={16} style={{ color: 'var(--accent)' }} />,
            bg: 'var(--accent-subtle)',
            label: t.dashboard.stats.sessions,
            value: totalSessions || '0',
            sub: totalSessions === 1 ? 'Sitzung' : 'Sitzungen',
          },
          {
            icon: <TrendingUp size={16} style={{ color: 'var(--green)' }} />,
            bg: 'var(--green-subtle)',
            label: t.dashboard.stats.avgAccuracy,
            value: avgAccuracy !== null ? `${avgAccuracy}%` : '—',
            sub: avgAccuracy !== null ? (avgAccuracy >= 75 ? '🎯 Gut!' : 'Weiter üben') : 'Noch keine Daten',
          },
          {
            icon: <Clock size={16} style={{ color: 'var(--purple)' }} />,
            bg: 'var(--purple-subtle)',
            label: t.dashboard.stats.daysToExam,
            value: daysUntilExam !== null ? (daysUntilExam > 0 ? daysUntilExam : '🎓') : '—',
            sub: daysUntilExam !== null && daysUntilExam > 0 ? 'Tage bis zur Prüfung' : daysUntilExam === 0 ? 'Heute!' : 'Kein Datum gesetzt',
          },
        ].map(({ icon, bg, label, value, sub }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="text-3xl font-bold" style={{ marginBottom: 4 }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── CEFR Levels ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="text-base font-semibold">{t.dashboard.ceflLevels}</h2>
        {!dbUser?.diagnosticDone && (
          <Link href="/diagnostic" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
            {t.dashboard.diagnosticBanner.cta} →
          </Link>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
        {relevantSections.map(sec => {
          const level    = levelMap[sec]
          const color    = SECTION_COLORS[sec]
          const subtle   = SECTION_SUBTLES[sec]
          const cefrColor = level ? (CEFR_COLORS[level.cefr] ?? color) : 'var(--card-border)'
          const SectionIcon = sec === 'LISTENING' ? Headphones : sec === 'WRITING' ? PenLine : sec === 'SPEAKING' ? Mic : BookOpen

          return (
            <div key={sec} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: level ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SectionIcon size={16} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.dashboard.sections[sec]}</p>
                    {!level && (
                      <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2 }}>{t.dashboard.notAssessed}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-2xl" style={{ color: level ? cefrColor : 'var(--card-border)' }}>
                  {level ? level.cefr : '?'}
                </span>
              </div>
              {level && (
                <>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: color, width: `${level.score * 100}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {CEFR_COLORS[level.cefr] ? `${level.cefr} · ${Math.round(level.score * 100)}%` : ''}
                    </p>
                    {sec === 'READING' && (
                      <Link href="/practice/part5" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                        {t.dashboard.practiceNow} →
                      </Link>
                    )}
                  </div>
                </>
              )}
              {!level && (
                <Link href="/diagnostic" className="text-xs font-medium" style={{ color: 'var(--muted)', display: 'block', marginTop: 8 }}>
                  → Einstufung starten
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Practice cards ─────────────────────────────────────────────── */}
      {(examType === 'LISTENING_READING' || examType === 'FULL_CERTIFICATE' || !examType) && (
        <>
          <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>{t.dashboard.practiceByPart}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
            {PART_META.map(({ part, href, icon: Icon, color, subtle }) => {
              const info = t.dashboard.parts[part]
              const prog = progByPart[part]
              const pct  = prog ? Math.round(prog.accuracy * 100) : null
              return (
                <Link key={part} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{
                    padding: '20px',
                    height: '100%',
                    transition: 'border-color 0.15s',
                    cursor: 'pointer',
                    borderColor: 'var(--card-border)',
                  }}
                  >
                    {/* Icon + badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      {pct !== null && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: pct >= 80 ? 'rgba(74,222,128,0.15)' : pct >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                          color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)',
                        }}>{pct}%</span>
                      )}
                    </div>

                    {/* Title + meta */}
                    <p className="font-semibold text-sm" style={{ marginBottom: 2 }}>{info.label}</p>
                    <p style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' }}>{info.part}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>{info.desc}</p>

                    {/* Progress */}
                    {prog ? (
                      <>
                        <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', marginBottom: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 99, background: color, width: `${prog.accuracy * 100}%` }} />
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--muted)' }}>{prog.sampleSize} {t.dashboard.questionsAnswered}</p>
                      </>
                    ) : (
                      <p style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {t.dashboard.notStarted} · {info.count}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* ── Recent activity ────────────────────────────────────────────── */}
      {dbUser && dbUser.sessions.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="text-base font-semibold">{t.dashboard.recentSessions}</h2>
            <Link href="/progress" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              {t.dashboard.practiceNow} →
            </Link>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {[t.dashboard.table.part, t.dashboard.table.accuracy, t.dashboard.table.score, t.dashboard.table.duration, t.dashboard.table.date].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbUser.sessions.map((s, i) => {
                  const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : null
                  const partLabel = s.parts.length > 0
                    ? s.parts.map(p => {
                        const info = t.dashboard.parts[p as 5 | 6 | 7]
                        return info ? info.shortLabel ?? info.label : `Part ${p}`
                      }).join(', ')
                    : s.mode
                  return (
                    <tr key={s.id} style={{ borderBottom: i < dbUser.sessions.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 500 }}>{partLabel}</td>
                      <td style={{ padding: '12px 18px' }}>
                        {pct !== null ? (
                          <span style={{
                            fontWeight: 700,
                            color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)',
                          }}>{pct}%</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>
                        {s.score ?? '—'}/{s.maxScore ?? '—'}
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>
                        {s.durationSec ? `${Math.floor(s.durationSec / 60)}m ${s.durationSec % 60}s` : '—'}
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!dbUser || dbUser.sessions.length === 0) && dbUser?.diagnosticDone && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <BookOpen size={36} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
          <h3 className="font-semibold" style={{ marginBottom: 8 }}>{t.dashboard.noSessions.title}</h3>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 22, lineHeight: 1.6 }}>
            {t.dashboard.noSessions.desc}
          </p>
          <Link href="/practice/part5" className="btn-primary">{t.dashboard.noSessions.cta}</Link>
        </div>
      )}
    </div>
  )
}
