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
  const L_WEIGHTS: Record<number, number> = { 1: 6, 2: 25, 3: 39, 4: 30 }
  const R_WEIGHTS: Record<number, number> = { 5: 30, 6: 16, 7: 54 }
  const lWeightedAcc = listeningProgress.length
    ? listeningProgress.reduce((s, p) => s + p.accuracy * (L_WEIGHTS[p.part] ?? 1), 0)
      / listeningProgress.reduce((s, p) => s + (L_WEIGHTS[p.part] ?? 1), 0)
    : null
  const rWeightedAcc = readingProgress.length
    ? readingProgress.reduce((s, p) => s + p.accuracy * (R_WEIGHTS[p.part] ?? 1), 0)
      / readingProgress.reduce((s, p) => s + (R_WEIGHTS[p.part] ?? 1), 0)
    : null
  const lScore = lWeightedAcc !== null ? accuracyToListeningScore(lWeightedAcc) : null
  const rScore = rWeightedAcc !== null ? accuracyToReadingScore(rWeightedAcc)   : null
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
    { label: 'Speaking Read Aloud',    href: '/practice/speaking/read-aloud',  color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 1) },
    { label: 'Speaking Beschreiben',   href: '/practice/speaking/describe',    color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 2) },
    { label: 'Speaking Beantworten',   href: '/practice/speaking/respond',     color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 3) },
    { label: 'Speaking mit Dokument',  href: '/practice/speaking/respond-doc', color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 4) },
    { label: 'Speaking Meinung',       href: '/practice/speaking/opinion',     color: '#fb923c', icon: '🎤', hasProgress: spProg.some(p => p.part === 5) },
    { label: 'Writing Sätze',          href: '/practice/writing/sentences',    color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 1) },
    { label: 'Writing E-Mail',         href: '/practice/writing/email',        color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 2) },
    { label: 'Writing Essay',          href: '/practice/writing/essay',        color: '#AE00FF', icon: '✍️', hasProgress: wrProg.some(p => p.part === 3) },
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

  // Only show missions if diagnostic is done (Step 2 is active/ongoing)
  if (dbUser?.diagnosticDone) {
    if (examType === 'SPEAKING_WRITING') {
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
  }

  const totalMissionMins = mission.reduce((sum, s) => sum + (s.count.includes('Min') ? parseInt(s.count) : 8), 0)

  const practicedToday = allSessions.some(s => new Date(s.createdAt).toDateString() === new Date().toDateString())

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

      {streak.current > 0 && !practicedToday && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 18px', borderRadius: 12, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.35)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fb923c' }}>
              Dein {streak.current}-Tage Streak endet heute! Übe jetzt um ihn zu erhalten.
            </p>
          </div>
          <Link href="/test-training" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <div style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.5)', color: '#fb923c', fontSize: 12, fontWeight: 700 }}>
              Jetzt üben
            </div>
          </Link>
        </div>
      )}

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

      {/* ── Trainingsweg (3-Schritte mit Beschreibungen) ─────────────────── */}
      {(() => {
        const isSW = examType === 'SPEAKING_WRITING'
        const practicedCount = isSW
          ? (spProg.length > 0 ? 1 : 0) + (wrProg.length > 0 ? 1 : 0)
          : ALL_LR_PARTS.filter(p => p.prog).length
        const practiceTarget = isSW ? 2 : 7
        const step1Done = !!dbUser?.diagnosticDone
        const step1CanStart = !step1Done && !!examType && !!dbUser?.examDate
        const step2Active = step1Done
        const step2Pct = Math.min(100, Math.round(practicedCount / practiceTarget * 100))
        const step3Ready = avgAccuracy !== null && avgAccuracy >= 65

        const steps = [
          {
            num: 1,
            label: 'Einstufungstest',
            desc: 'Dein Sprachniveau ist noch unbekannt. Der 10-minütige Test legt den Grundstein für deinen personalisierten Lernplan.',
            status: step1Done ? '✓ Abgeschlossen' : !examType || !dbUser?.examDate ? 'Einstellungen erforderlich' : 'Bereit zum Starten',
            done: step1Done,
            active: step1CanStart,
            href: '/diagnostic',
            color: '#04FF88',
          },
          {
            num: 2,
            label: 'Üben',
            desc: 'Gezieltes Training nach deinem Level. Trainiere die Bereiche, in denen du am meisten Fortschritt brauchst.',
            status: step2Active ? `${practicedCount} / ${practiceTarget} ${isSW ? 'Bereiche' : 'Parts'} geübt` : 'Nach Einstufungstest',
            done: step2Active && practicedCount >= practiceTarget,
            active: step2Active && practicedCount < practiceTarget,
            href: '/test-training',
            color: '#D5FD44',
          },
          {
            num: 3,
            label: 'Prüfen',
            desc: 'Vollprüfungs-Simulation unter echten Bedingungen. Teste dein Wissen unter Druck und bekommen deinen finalen Score.',
            status: step3Ready ? '✓ Bereit' : 'Ab ≥65% Genauigkeit',
            done: false,
            active: step3Ready,
            href: isSW ? '/speaking' : '/practice/full-exam',
            color: '#fbbf24',
          },
        ]

        return (
          <div style={{ marginBottom: 28 }}>
            {!step1Done && (!examType || !dbUser?.examDate) && (
              <Link href="/settings" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: 'rgba(251,146,60,0.12)',
                  border: '1.5px solid rgba(251,146,60,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>⚙️</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>Einstellungen erforderlich</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0 0' }}>Prüfungstyp und -datum festlegen, um zu starten</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fb923c' }}>Jetzt einrichten →</div>
                </div>
              </Link>
            )}
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Dein Trainingsweg</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {steps.map((step) => {
                const isClickable = step.active || step.done
                return (
                <a key={step.num} href={isClickable ? step.href : undefined}
                  style={{
                    textDecoration: 'none',
                    cursor: isClickable ? 'pointer' : 'not-allowed',
                    opacity: !step.done && !step.active ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    display: 'block',
                  }}>
                  <div className="card" style={{
                    padding: '18px 16px',
                    border: `1.5px solid ${step.done || step.active ? step.color + '50' : 'var(--card-border)'}`,
                    background: step.done ? `${step.color}12` : step.active ? `${step.color}10` : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    transition: 'all 0.2s ease',
                    boxShadow: step.active && !step.done ? `0 4px 12px ${step.color}20` : 'none',
                  }}>
                    {/* Step Number + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: step.done ? step.color : step.active ? `${step.color}30` : 'var(--card-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: step.done ? '#0d1b2a' : step.color,
                        flexShrink: 0,
                      }}>
                        {step.done ? '✓' : step.num}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{step.label}</p>
                        <p style={{ fontSize: 10, color: step.color, fontWeight: 600 }}>{step.status}</p>
                      </div>
                    </div>
                    {/* Description */}
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
                  </div>
                </a>
                )
              })}

            </div>
          </div>
        )
      })()}

      {/* ── REMOVED: "Nächster Schritt" functionality now integrated in Trainingsweg ──── */}

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

      {/* ── Sprachniveau (nur nach Einstufungstest) ─────────────────────── */}
      {dbUser?.diagnosticDone && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <p className="text-sm font-semibold" style={{ marginBottom: 12 }}>Aktuelles Sprachniveau</p>
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
      )}

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
