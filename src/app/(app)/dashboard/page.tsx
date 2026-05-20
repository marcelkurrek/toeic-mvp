import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, TrendingUp, Headphones, PenLine, Mic,
  Zap, ChevronRight, Target, Flame, ArrowRight, Star,
  HelpCircle,
} from 'lucide-react'
import { getServerTranslations } from '@/lib/i18n/server'
import { computeStreak } from '@/lib/streak'
import WeeklyHeatmap from '@/components/WeeklyHeatmap'

type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'

const SECTION_COLORS: Record<Section, string> = {
  LISTENING: '#22d3ee',
  READING:   '#4ade80',
  SPEAKING:  '#fb923c',
  WRITING:   '#a78bfa',
}

const CEFR_COLORS: Record<string, string> = {
  A1: '#f87171', A2: '#fb923c', B1: '#fbbf24',
  B2: '#4ade80', C1: '#22d3ee', C2: '#a78bfa',
}

const PART_HREFS: Record<number, string> = {
  5: '/practice/part5',
  6: '/practice/part6',
  7: '/practice/part7',
}

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

  const allSessions    = await prisma.session.findMany({ where: { userId: dbUser?.id ?? '' }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
  const totalSessions  = dbUser?.sessions.length ?? 0
  const avgAccuracy    = dbUser?.progress.length
    ? Math.round(dbUser.progress.reduce((s, p) => s + p.accuracy, 0) / dbUser.progress.length * 100)
    : null
  const daysUntilExam  = dbUser?.examDate
    ? Math.ceil((new Date(dbUser.examDate).getTime() - Date.now()) / 86400000)
    : null
  const streak         = computeStreak(allSessions.map(s => s.createdAt))

  const totalQuestionsAnswered = (dbUser?.progress ?? []).reduce((sum, p) => sum + (p.sampleSize ?? 0), 0)
  const allProgress    = [...(dbUser?.progress ?? [])].sort((a, b) => b.accuracy - a.accuracy)
  const bestPartEntry  = allProgress.length > 0 ? allProgress[0] : null
  const bestPart       = bestPartEntry ? { part: bestPartEntry.part, pct: Math.round(bestPartEntry.accuracy * 100) } : null

  const scoreTarget    = (dbUser as { scoreTarget?: number | null } | null)?.scoreTarget ?? null
  const cefrToScore: Record<string, number> = { A1: 100, A2: 180, B1: 280, B2: 400, C1: 490, C2: 495 }
  const levels         = dbUser?.levels ?? []
  const estimatedScore = levels.length
    ? levels.reduce((sum, l) => sum + (cefrToScore[l.cefr] ?? 0), 0)
    : null
  const goalPct        = scoreTarget && estimatedScore !== null
    ? Math.min(100, Math.round(estimatedScore / scoreTarget * 100))
    : null

  const examType       = dbUser?.examType ?? null
  const relevantSections: Section[] = examType === 'LISTENING_READING'
    ? ['LISTENING', 'READING']
    : examType === 'SPEAKING_WRITING'
      ? ['SPEAKING', 'WRITING']
      : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

  const levelMap   = Object.fromEntries((dbUser?.levels   ?? []).map(l => [l.section, l]))
  const progByPart = Object.fromEntries((dbUser?.progress ?? []).map(p => [p.part, p]))

  // ── Smart recommendation ──────────────────────────────────────────────────
  type Rec = { href: string; title: string; reason: string; color: string; cta: string; badge?: string }
  let rec: Rec

  if (!dbUser?.diagnosticDone) {
    rec = {
      href:   '/diagnostic',
      title:  'Einstufungstest starten',
      reason: 'Dein Sprachniveau ist noch unbekannt. Der 10-minütige Test legt den Grundstein für deinen personalisierten Lernplan.',
      color:  '#fb923c',
      cta:    'Jetzt einstufen',
    }
  } else {
    const practicedParts = ([5, 6, 7] as const).filter(p => progByPart[p])

    if (practicedParts.length === 0) {
      rec = {
        href:   '/practice/part5',
        title:  'Erste Übung starten',
        reason: 'Du hast noch keine Reading-Übungen abgeschlossen. Starte mit Part 5 — Grammatik & Wortschatz.',
        color:  '#22d3ee',
        cta:    'Part 5 starten',
      }
    } else {
      const allStrong = practicedParts.every(p => (progByPart[p]?.accuracy ?? 0) >= 0.80)

      if (allStrong) {
        rec = {
          href:   '/practice/mini-exam',
          title:  'Mini-Prüfung — du bist bereit',
          reason: 'Alle geübten Parts liegen über 80% Genauigkeit. Teste dich unter echten Prüfungsbedingungen.',
          color:  '#a78bfa',
          cta:    'Mini-Prüfung starten',
          badge:  '🎯 Stark!',
        }
      } else {
        const weakest = [...practicedParts].sort(
          (a, b) => (progByPart[a]?.accuracy ?? 0) - (progByPart[b]?.accuracy ?? 0)
        )[0]
        const pct  = Math.round((progByPart[weakest]?.accuracy ?? 0) * 100)
        const href = PART_HREFS[weakest]
        const names: Record<number, string> = { 5: 'Part 5 · Grammatik & Wortschatz', 6: 'Part 6 · Textergänzung', 7: 'Part 7 · Leseverständnis' }
        rec = {
          href,
          title:  names[weakest] ?? `Part ${weakest} üben`,
          reason: `Dein schwächster Bereich liegt bei ${pct}% Genauigkeit. Gezieltes Training hier bringt dich am schnellsten voran.`,
          color:  pct < 60 ? '#ef4444' : '#fbbf24',
          cta:    'Jetzt üben',
          badge:  `${pct}%`,
        }
      }
    }
  }

  const firstName = dbUser?.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? ''

  const SectionIcon = (s: Section) =>
    s === 'LISTENING' ? Headphones : s === 'WRITING' ? PenLine : s === 'SPEAKING' ? Mic : BookOpen

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 4 }}>
          Hallo, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {daysUntilExam !== null && daysUntilExam > 0
            ? `Noch ${daysUntilExam} Tage bis zur Prüfung`
            : daysUntilExam === 0
              ? '🎓 Prüfungstag!'
              : 'Kein Prüfungsdatum gesetzt — in den Einstellungen ändern'}
        </p>
      </div>

      {/* ── Nächster Schritt (Hero) ─────────────────────────────────────── */}
      <Link href={rec.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
        <div style={{
          padding: '24px 28px', borderRadius: 16,
          background: `linear-gradient(135deg, ${rec.color}18 0%, ${rec.color}06 100%)`,
          border: `1.5px solid ${rec.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: rec.color, marginBottom: 6 }}>
              Nächster Schritt
            </p>
            <p className="font-bold" style={{ fontSize: 18, marginBottom: 6, lineHeight: 1.3 }}>{rec.title}</p>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6, maxWidth: 520 }}>{rec.reason}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {rec.badge && (
              <span style={{
                fontSize: 15, fontWeight: 800, padding: '6px 14px', borderRadius: 10,
                background: `${rec.color}20`, color: rec.color,
              }}>
                {rec.badge}
              </span>
            )}
            <div className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '10px 20px' }}>
              {rec.cta} <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            icon: <Flame size={15} style={{ color: '#fb923c' }} />,
            bg: 'rgba(251,146,60,0.12)',
            label: 'Streak',
            value: streak.current > 0 ? `${streak.current}🔥` : '0',
            sub: streak.current > 0 ? `Längste: ${streak.longest}d` : 'Heute starten',
          },
          {
            icon: <TrendingUp size={15} style={{ color: 'var(--success)' }} />,
            bg: 'rgba(74,222,128,0.12)',
            label: 'Ø Genauigkeit',
            value: avgAccuracy !== null ? `${avgAccuracy}%` : '—',
            sub: avgAccuracy !== null ? (avgAccuracy >= 75 ? 'Sehr gut!' : avgAccuracy >= 60 ? 'Gut' : 'Weiter üben') : 'Noch keine Daten',
          },
          {
            icon: <HelpCircle size={15} style={{ color: 'var(--accent)' }} />,
            bg: 'var(--accent-subtle)',
            label: 'Fragen beantwortet',
            value: totalQuestionsAnswered > 0 ? String(totalQuestionsAnswered) : '0',
            sub: totalQuestionsAnswered === 1 ? '1 Frage' : `${totalQuestionsAnswered} Fragen`,
          },
          {
            icon: <Star size={15} style={{ color: '#fbbf24' }} />,
            bg: 'rgba(251,191,36,0.12)',
            label: 'Bester Part',
            value: bestPart ? `Part ${bestPart.part}` : '—',
            sub: bestPart ? `${bestPart.pct}% Genauigkeit` : 'Noch keine Daten',
          },
        ].map(({ icon, bg, label, value, sub }) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ marginBottom: 2 }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Aktivität (Kalender) ───────────────────────────────────────── */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <p className="text-sm font-semibold" style={{ marginBottom: 14 }}>Aktivität</p>
        <WeeklyHeatmap sessionDates={allSessions.map(s => s.createdAt.toISOString())} />
      </div>

      {/* ── Sprachniveau (kompakt) ─────────────────────────────────────── */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p className="text-sm font-semibold">Aktuelles Sprachniveau</p>
          {!dbUser?.diagnosticDone && (
            <Link href="/diagnostic" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> Einstufen
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {relevantSections.map(sec => {
            const level = levelMap[sec]
            const color = SECTION_COLORS[sec]
            const Icon  = SectionIcon(sec)
            const cefrColor = level ? (CEFR_COLORS[level.cefr] ?? color) : undefined
            return (
              <div key={sec} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 10,
                background: level ? `${cefrColor}12` : 'var(--card-border)',
                border: `1px solid ${level ? `${cefrColor}30` : 'transparent'}`,
                flex: '1 1 auto', minWidth: 120,
              }}>
                <Icon size={13} style={{ color: level ? cefrColor : 'var(--muted)', flexShrink: 0 }} />
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{t.dashboard.sections[sec]}</span>
                <span className="font-bold text-sm" style={{ marginLeft: 'auto', color: level ? cefrColor : 'var(--muted)' }}>
                  {level ? level.cefr : '?'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Lernziel ───────────────────────────────────────────────────── */}
      {scoreTarget && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={14} style={{ color: '#fbbf24' }} />
              <p className="text-sm font-semibold">Lernziel: {scoreTarget} Punkte</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {goalPct !== null && (
                <span className="font-bold text-sm" style={{ color: goalPct >= 100 ? 'var(--success)' : '#fbbf24' }}>
                  {goalPct}%
                </span>
              )}
              <Link href="/settings" style={{ fontSize: 11, color: 'var(--muted)' }}>ändern</Link>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: goalPct !== null && goalPct >= 100 ? 'var(--success)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)',
              width: `${goalPct ?? 0}%`, transition: 'width 0.5s',
            }} />
          </div>
          {estimatedScore !== null && scoreTarget > estimatedScore && (
            <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 6 }}>
              Geschätzter Score: {estimatedScore} · noch {scoreTarget - estimatedScore} Punkte bis zum Ziel
            </p>
          )}
        </div>
      )}

      {/* ── Letzte Sitzungen ───────────────────────────────────────────── */}
      {dbUser && dbUser.sessions.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="text-sm font-semibold">Letzte Sitzungen</p>
            <Link href="/progress" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Alle ansehen <ChevronRight size={12} />
            </Link>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {dbUser.sessions.map((s, i) => {
              const pct = s.score != null && s.maxScore ? Math.round(s.score / s.maxScore * 100) : null
              const partLabel = s.parts.length > 0
                ? s.parts.map(p => {
                    const info = t.dashboard.parts[p as 5 | 6 | 7]
                    return info ? (info.shortLabel ?? info.label) : `Part ${p}`
                  }).join(', ')
                : s.mode
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
                  borderBottom: i < dbUser.sessions.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-sm font-medium">{partLabel}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 1 }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                      {s.durationSec ? ` · ${Math.floor(s.durationSec / 60)}m` : ''}
                    </p>
                  </div>
                  {pct !== null && (
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)',
                    }}>
                      {pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {(!dbUser || dbUser.sessions.length === 0) && dbUser?.diagnosticDone && (
        <div className="card" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <BookOpen size={32} style={{ color: 'var(--muted)', margin: '0 auto 14px' }} />
          <p className="font-semibold" style={{ marginBottom: 6 }}>Noch keine Übungen</p>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Starte deine erste Übungseinheit — das System wählt den besten Einstiegspunkt für dich.
          </p>
          <Link href={rec.href} className="btn-primary">{rec.cta}</Link>
        </div>
      )}
    </div>
  )
}
