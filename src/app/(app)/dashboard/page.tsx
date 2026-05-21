import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, TrendingUp, Headphones, PenLine, Mic,
  Zap, ChevronRight, Target, Flame, ArrowRight, Star,
  HelpCircle, PlayCircle,
} from 'lucide-react'
import { getServerTranslations } from '@/lib/i18n/server'
import { computeStreak } from '@/lib/streak'
import WeeklyHeatmap from '@/components/WeeklyHeatmap'
import { accuracyToListeningScore, accuracyToReadingScore } from '@/lib/toeicScore'

type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'

const SECTION_COLORS: Record<Section, string> = {
  LISTENING: '#04FF88',
  READING:   '#D5FD44',
  SPEAKING:  '#fb923c',
  WRITING:   '#AE00FF',
}

const CEFR_COLORS: Record<string, string> = {
  A1: '#f87171', A2: '#fb923c', B1: '#fbbf24',
  B2: '#D5FD44', C1: '#04FF88', C2: '#AE00FF',
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
  const totalSessions  = allSessions.length
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
  const bestPart       = bestPartEntry ? { part: bestPartEntry.part, section: bestPartEntry.section, pct: Math.round(bestPartEntry.accuracy * 100) } : null

  const scoreTarget    = (dbUser as { scoreTarget?: number | null } | null)?.scoreTarget ?? null
  const levels         = dbUser?.levels ?? []

  // L+R score estimation from accuracy per section (5–495 each, total 10–990)
  // Must filter by section to avoid collision with SPEAKING parts 1-4
  const listeningProgress = (dbUser?.progress ?? []).filter(p => p.section === 'LISTENING')
  const readingProgress   = (dbUser?.progress ?? []).filter(p => p.section === 'READING')
  const listeningAccuracy = listeningProgress.length
    ? listeningProgress.reduce((s, p) => s + p.accuracy, 0) / listeningProgress.length
    : null
  const readingAccuracy = readingProgress.length
    ? readingProgress.reduce((s, p) => s + p.accuracy, 0) / readingProgress.length
    : null
  const lScore = listeningAccuracy !== null ? accuracyToListeningScore(listeningAccuracy) : null
  const rScore = readingAccuracy   !== null ? accuracyToReadingScore(readingAccuracy)   : null
  const estimatedScore = lScore !== null && rScore !== null
    ? lScore + rScore
    : lScore ?? rScore ?? null

  const goalPct = scoreTarget && estimatedScore !== null
    ? Math.min(100, Math.round(estimatedScore / scoreTarget * 100))
    : null

  const examType       = dbUser?.examType ?? null
  const relevantSections: Section[] = examType === 'LISTENING_READING'
    ? ['LISTENING', 'READING']
    : examType === 'SPEAKING_WRITING'
      ? ['SPEAKING', 'WRITING']
      : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

  const levelMap   = Object.fromEntries((dbUser?.levels ?? []).map(l => [l.section, l]))
  // Section-aware progress maps to avoid part-number collisions between sections
  const lProg = Object.fromEntries((dbUser?.progress ?? []).filter(p => p.section === 'LISTENING').map(p => [p.part, p]))
  const rProg = Object.fromEntries((dbUser?.progress ?? []).filter(p => p.section === 'READING').map(p => [p.part, p]))
  const spProg = (dbUser?.progress ?? []).filter(p => p.section === 'SPEAKING')
  const wrProg = (dbUser?.progress ?? []).filter(p => p.section === 'WRITING')
  // Legacy map for backwards compat (best part, etc)
  const progByPart = Object.fromEntries((dbUser?.progress ?? []).map(p => [`${p.section}_${p.part}`, p]))

  // All L+R parts with their section-aware accuracy
  const ALL_LR_PARTS = [
    { part: 1, section: 'LISTENING', label: 'Listening Part 1 · Fotos beschreiben',   href: '/practice/part1', color: '#04FF88', prog: lProg[1] },
    { part: 2, section: 'LISTENING', label: 'Listening Part 2 · Frage & Antwort',     href: '/practice/part2', color: '#04FF88', prog: lProg[2] },
    { part: 3, section: 'LISTENING', label: 'Listening Part 3 · Gespräche',            href: '/practice/part3', color: '#04FF88', prog: lProg[3] },
    { part: 4, section: 'LISTENING', label: 'Listening Part 4 · Monologe',             href: '/practice/part4', color: '#04FF88', prog: lProg[4] },
    { part: 5, section: 'READING',   label: 'Reading Part 5 · Grammatik & Wortschatz', href: '/practice/part5', color: '#D5FD44', prog: rProg[5] },
    { part: 6, section: 'READING',   label: 'Reading Part 6 · Textergänzung',          href: '/practice/part6', color: '#D5FD44', prog: rProg[6] },
    { part: 7, section: 'READING',   label: 'Reading Part 7 · Leseverständnis',        href: '/practice/part7', color: '#D5FD44', prog: rProg[7] },
  ]
  // DB part numbers: Speaking read-aloud=1, describe=2, respond=3, respond-doc=4, opinion=5
  //                  Writing sentences=1, email=2, essay=3
  const ALL_SW_CONFIGS = [
    { label: 'Speaking Read Aloud',  href: '/practice/speaking/read-aloud', color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 1) },
    { label: 'Speaking Beschreiben', href: '/practice/speaking/describe',   color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 2) },
    { label: 'Speaking Meinung',     href: '/practice/speaking/opinion',    color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 5) },
    { label: 'Writing E-Mail',       href: '/practice/writing/email',       color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 2) },
    { label: 'Writing Essay',        href: '/practice/writing/essay',       color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 3) },
    { label: 'Writing Sätze',        href: '/practice/writing/sentences',   color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 1) },
  ]

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
  } else if (examType === 'SPEAKING_WRITING') {
    // For Speaking/Writing users — recommend based on what they haven't practiced
    const spDone = spProg.length > 0
    const wrDone = wrProg.length > 0
    if (!spDone) {
      rec = { href: '/practice/speaking/read-aloud', title: 'Speaking üben — Read Aloud', reason: 'Starte dein Speaking-Training. Vorlesen ist der beste Einstieg für Aussprache und Flüssigkeit.', color: '#fb923c', cta: 'Jetzt starten' }
    } else if (!wrDone) {
      rec = { href: '/practice/writing/email', title: 'Writing üben — E-Mail verfassen', reason: 'Du hast Speaking geübt. Jetzt: Writing. E-Mail-Aufgaben sind der meistgeprufte Writing-Part im TOEIC.', color: '#AE00FF', cta: 'Jetzt starten' }
    } else {
      const spAvg = spProg.length ? Math.round(spProg.reduce((s, p) => s + p.accuracy, 0) / spProg.length * 100) : 0
      const wrAvg = wrProg.length ? Math.round(wrProg.reduce((s, p) => s + p.accuracy, 0) / wrProg.length * 100) : 0
      const weakSection = spAvg <= wrAvg ? { href: '/speaking', label: 'Speaking', pct: spAvg, color: '#fb923c' } : { href: '/writing', label: 'Writing', pct: wrAvg, color: '#AE00FF' }
      rec = { href: weakSection.href, title: `${weakSection.label} verbessern`, reason: `Dein ${weakSection.label}-Bereich liegt bei ${weakSection.pct}% — gezielte Wiederholung bringt dich am schnellsten voran.`, color: weakSection.color, cta: 'Weiter üben', badge: `${weakSection.pct}%` }
    }
  } else {
    // LISTENING_READING or FULL — check all 7 L+R parts
    const relevantParts = examType === 'FULL_CERTIFICATE' ? ALL_LR_PARTS : ALL_LR_PARTS
    const practicedParts = relevantParts.filter(p => p.prog)
    const unpracticed = relevantParts.filter(p => !p.prog)

    if (practicedParts.length === 0) {
      rec = {
        href:   '/practice/part1',
        title:  'Erste Übung starten — Listening Part 1',
        reason: 'Du hast noch keine Übungen abgeschlossen. Starte mit Listening Part 1 — Fotos beschreiben ist der einfachste Einstieg.',
        color:  '#04FF88',
        cta:    'Listening starten',
      }
    } else {
      const allStrong = practicedParts.every(p => (p.prog?.accuracy ?? 0) >= 0.80)
      if (allStrong && unpracticed.length === 0) {
        rec = { href: '/practice/full-exam', title: 'TOEIC Vollprüfung — du bist bereit', reason: 'Alle Parts liegen über 80% Genauigkeit. Teste dich jetzt unter echten Prüfungsbedingungen mit Timer.', color: '#fbbf24', cta: 'Vollprüfung starten', badge: '🎯 Stark!' }
      } else if (unpracticed.length > 0 && practicedParts.length >= 3) {
        const next = unpracticed[0]
        rec = { href: next.href, title: next.label, reason: `Du hast ${practicedParts.length} Parts geübt. Expand jetzt auf ungeübte Bereiche — ${next.label.split('·')[0].trim()} als nächstes.`, color: next.color, cta: 'Neu starten' }
      } else {
        const weakest = [...practicedParts].sort((a, b) => (a.prog?.accuracy ?? 0) - (b.prog?.accuracy ?? 0))[0]
        const pct = Math.round((weakest.prog?.accuracy ?? 0) * 100)
        rec = { href: weakest.href, title: weakest.label, reason: `Dein schwächster Bereich liegt bei ${pct}% Genauigkeit. Gezieltes Training bringt dich am schnellsten voran.`, color: pct < 60 ? '#ef4444' : '#fbbf24', cta: 'Jetzt üben', badge: `${pct}%` }
      }
    }
  }

  // ── Daily Mission ──────────────────────────────────────────────────────────
  type MissionStep = { label: string; href: string; count: string; color: string; icon: string }
  const mission: MissionStep[] = []

  if (!dbUser?.diagnosticDone) {
    mission.push({ label: 'Einstufungstest', href: '/diagnostic', count: '~15 Min', color: '#fb923c', icon: '⚡' })
  } else if (examType === 'SPEAKING_WRITING') {
    // Speaking/Writing mission
    const unpracticedSW = ALL_SW_CONFIGS.filter(c => !c.hasProgress)
    const practicedSW = ALL_SW_CONFIGS.filter(c => c.hasProgress)
    if (unpracticedSW.length > 0) {
      mission.push({ label: unpracticedSW[0].label, href: unpracticedSW[0].href, count: 'Neu · Erste Aufgabe', color: unpracticedSW[0].color, icon: unpracticedSW[0].icon })
    }
    if (unpracticedSW.length > 1 && mission.length < 2) {
      mission.push({ label: unpracticedSW[1].label, href: unpracticedSW[1].href, count: 'Neu · Erste Aufgabe', color: unpracticedSW[1].color, icon: unpracticedSW[1].icon })
    }
    if (practicedSW.length > 0 && mission.length < 3) {
      mission.push({ label: practicedSW[0].label, href: practicedSW[0].href, count: 'Auffrischung · 3 Aufgaben', color: practicedSW[0].color, icon: practicedSW[0].icon })
    }
    if (mission.length === 0) {
      mission.push({ label: 'Speaking — Read Aloud', href: '/practice/speaking/read-aloud', count: '~10 Min', color: '#fb923c', icon: '🎤' })
      mission.push({ label: 'Writing — E-Mail verfassen', href: '/practice/writing/email', count: '~10 Min', color: '#AE00FF', icon: '✍️' })
    }
  } else {
    // Listening/Reading mission (LISTENING_READING or FULL)
    const practiced = ALL_LR_PARTS.filter(p => p.prog)
    const unpracticed = ALL_LR_PARTS.filter(p => !p.prog)
    const weak = practiced.filter(p => (p.prog?.accuracy ?? 1) < 0.65)
      .sort((a, b) => (a.prog?.accuracy ?? 1) - (b.prog?.accuracy ?? 1))

    // Add weakest practiced parts first
    weak.slice(0, 2).forEach(p => {
      const acc = Math.round((p.prog?.accuracy ?? 0) * 100)
      mission.push({ label: p.label.split('·')[0].trim(), href: p.href, count: `10 Fragen · ${acc}% bisher`, color: p.color, icon: p.section === 'LISTENING' ? '🎧' : '📖' })
    })
    // Add one unpracticed part if exists
    if (unpracticed.length > 0 && mission.length < 3) {
      const next = unpracticed[0]
      mission.push({ label: next.label.split('·')[0].trim(), href: next.href, count: 'Neu · 6 Fragen', color: next.color, icon: next.section === 'LISTENING' ? '🎧' : '📖' })
    }
    // Fallback: strongest part for warm-up
    if (mission.length === 0 && practiced.length > 0) {
      const best = practiced.sort((a, b) => (b.prog?.accuracy ?? 0) - (a.prog?.accuracy ?? 0))[0]
      mission.push({ label: best.label.split('·')[0].trim(), href: best.href, count: '10 Fragen · Auffrischung', color: best.color, icon: best.section === 'LISTENING' ? '🎧' : '📖' })
    }
    if (mission.length < 3) {
      mission.push({ label: 'Vollprüfung', href: '/practice/full-exam', count: '120 Min · L+R Score', color: '#fbbf24', icon: '🏆' })
    }
  }

  const totalMissionMins = mission.reduce((sum, s) => sum + (s.count.includes('Min') ? parseInt(s.count) : 8), 0)

  const firstName = dbUser?.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? ''

  const currPct = dbUser?.sessions[0]?.score != null && dbUser?.sessions[0]?.maxScore
    ? Math.round((dbUser.sessions[0].score / dbUser.sessions[0].maxScore) * 100)
    : null
  const prevPct = dbUser?.sessions[1]?.score != null && dbUser?.sessions[1]?.maxScore
    ? Math.round((dbUser.sessions[1].score / dbUser.sessions[1].maxScore) * 100)
    : null
  const sessionDelta = currPct !== null && prevPct !== null ? currPct - prevPct : null

  const SectionIcon = (s: Section) =>
    s === 'LISTENING' ? Headphones : s === 'WRITING' ? PenLine : s === 'SPEAKING' ? Mic : BookOpen

  return (
    <div>

      {/* ── Trainingsweg ──────────────────────────────────────────────── */}
      {(() => {
        const isSW = examType === 'SPEAKING_WRITING'
        // For S+W: count speaking + writing practice types; for L+R: count L+R parts (max 7)
        const practicedCount = isSW
          ? (spProg.length > 0 ? 1 : 0) + (wrProg.length > 0 ? 1 : 0)
          : ALL_LR_PARTS.filter(p => p.prog).length
        const practiceTarget = isSW ? 2 : 7
        const step1Done = !!dbUser?.diagnosticDone
        const step2Active = step1Done
        const step2Pct = Math.min(100, Math.round(practicedCount / practiceTarget * 100))
        const step3Ready = avgAccuracy !== null && avgAccuracy >= 65
        const step3Href = isSW ? '/speaking' : '/practice/full-exam'
        const step3Label = isSW ? 'Testen' : 'Prüfen'
        const step2Label = isSW ? 'Üben' : 'Üben'

        const steps = [
          {
            num: 1, label: 'Einstufungstest', sub: step1Done ? 'Abgeschlossen' : 'Ausstehend',
            done: step1Done, active: !step1Done, href: '/diagnostic',
            color: '#04FF88',
          },
          {
            num: 2, label: step2Label, sub: step2Active ? `${practicedCount} / ${practiceTarget} ${isSW ? 'Bereiche' : 'Parts'} geübt` : 'Nach Einstufungstest',
            done: step2Active && practicedCount >= practiceTarget, active: step2Active && practicedCount < practiceTarget, href: '/test-training',
            color: '#D5FD44',
          },
          {
            num: 3, label: step3Label, sub: step3Ready ? 'Bereit für die Prüfung' : 'Ab ≥65% Genauigkeit',
            done: false, active: step3Ready, href: step3Href,
            color: '#fbbf24',
          },
        ]

        return (
          <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Dein Trainingsweg</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {steps.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <a href={step.active || step.done ? step.href : undefined}
                    style={{ flex: 1, textDecoration: 'none', padding: '10px 14px', borderRadius: 10, background: step.done ? `${step.color}12` : step.active ? `${step.color}10` : 'transparent', border: `1px solid ${step.done || step.active ? step.color + '40' : 'var(--card-border)'}`, opacity: !step.done && !step.active ? 0.45 : 1, transition: 'opacity 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: step.done ? step.color : step.active ? `${step.color}30` : 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: step.done ? '#0d1b2a' : step.color, flexShrink: 0 }}>
                        {step.done ? '✓' : step.num}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: step.done || step.active ? 'var(--fg)' : 'var(--muted)' }}>{step.label}</span>
                      {step.num === 2 && step2Active && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: `${step.color}20`, color: step.color }}>{step2Pct}%</span>
                      )}
                      {step.num === 3 && step3Ready && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: `${step.color}20`, color: step.color }}>Bereit</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--muted)', paddingLeft: 28 }}>{step.sub}</p>
                  </a>
                  {i < steps.length - 1 && (
                    <div style={{ width: 24, height: 1, background: 'var(--card-border)', flexShrink: 0, margin: '0 2px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

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

      {/* ── Daily Mission ─────────────────────────────────────────────── */}
      {mission.length > 0 && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 3 }}>Heutige Mission</p>
              <p className="font-semibold text-sm">~{totalMissionMins} Min · {mission.length} Einheiten</p>
            </div>
            <Link href={mission[0].href}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                <PlayCircle size={14} /> Starten
              </div>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mission.map((step, i) => (
              <Link key={i} href={step.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 10, background: step.color + '0D', border: `1px solid ${step.color}25`, transition: 'border-color 0.15s' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{step.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{step.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{step.count}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: step.color + '20', color: step.color }}>
                    {i + 1}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
            value: bestPart
              ? bestPart.section === 'LISTENING' ? `L · Part ${bestPart.part}`
              : bestPart.section === 'READING'   ? `R · Part ${bestPart.part}`
              : bestPart.section === 'SPEAKING'  ? `SP · Part ${bestPart.part}`
              : `WR · Part ${bestPart.part}`
              : '—',
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

      {/* ── Geschätzter TOEIC-Score L+R ───────────────────────────────── */}
      {(lScore !== null || rScore !== null || scoreTarget) && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={14} style={{ color: '#fbbf24' }} />
              <p className="text-sm font-semibold">Geschätzter TOEIC-Score</p>
            </div>
            <Link href="/settings" style={{ fontSize: 11, color: 'var(--muted)' }}>Ziel ändern</Link>
          </div>

          {/* L + R score tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Listening (L)', score: lScore, color: '#04FF88', max: 495 },
              { label: 'Reading (R)',   score: rScore, color: '#D5FD44', max: 495 },
              { label: 'Gesamt',        score: estimatedScore, color: '#fbbf24', max: 990, bold: true },
            ].map(({ label, score, color, max, bold }) => (
              <div key={label} style={{
                padding: '12px 14px', borderRadius: 12,
                background: score !== null ? `${color}12` : 'var(--card-border)',
                border: `1px solid ${score !== null ? `${color}30` : 'transparent'}`,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: bold ? 22 : 20, fontWeight: 800, color: score !== null ? color : 'var(--muted)' }}>
                  {score !== null ? score : '—'}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>/ {max}</p>
              </div>
            ))}
          </div>

          {scoreTarget && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Ziel: {scoreTarget} Punkte</p>
                {goalPct !== null && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: goalPct >= 100 ? 'var(--success)' : '#fbbf24' }}>
                    {goalPct}%
                  </span>
                )}
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
                  Noch {scoreTarget - estimatedScore} Punkte bis zum Ziel
                </p>
              )}
            </>
          )}
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>
            Schätzung basiert auf deiner Übungsgenauigkeit. Echter TOEIC-Score erfordert offizielle Prüfung.
          </p>
          <details style={{ marginTop: 10 }}>
            <summary style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
              📊 Genauigkeit → TOEIC Punkte (Orientierungstabelle)
            </summary>
            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              {[
                { range: '≥ 90%', score: '800 – 990', color: '#04FF88' },
                { range: '80 – 89%', score: '650 – 800', color: '#D5FD44' },
                { range: '70 – 79%', score: '550 – 650', color: '#fbbf24' },
                { range: '60 – 69%', score: '450 – 550', color: '#fb923c' },
                { range: '< 60%', score: '< 450', color: '#ef4444' },
              ].map(({ range, score, color }) => (
                <div key={range} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{range} Genauigkeit</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>≈ {score} Punkte</span>
                </div>
              ))}
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>Näherungswerte — offizieller Score variiert je nach Tagesform und Fragenset.</p>
            </div>
          </details>
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
          {sessionDelta !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, marginBottom: 12,
              background: sessionDelta >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${sessionDelta >= 0 ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <span style={{ fontSize: 18 }}>{sessionDelta >= 0 ? '📈' : '📉'}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: sessionDelta >= 0 ? 'var(--success)' : '#ef4444' }}>
                  {sessionDelta >= 0 ? `+${sessionDelta}%` : `${sessionDelta}%`}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>
                  {sessionDelta >= 0
                    ? 'besser als letzte Session'
                    : 'schlechter als letzte Session'}
                </span>
                {sessionDelta >= 5 && <span style={{ fontSize: 11, color: 'var(--success)', marginLeft: 8, fontWeight: 600 }}>Auf Kurs! 🎯</span>}
              </div>
            </div>
          )}
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
