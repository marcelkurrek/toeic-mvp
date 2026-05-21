import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, BookOpen, Headphones, Mic, PenLine, Zap, ChevronRight, Target, Clock } from 'lucide-react'

type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'

const SECTION_COLORS: Record<string, string> = {
  LISTENING: '#04FF88',
  READING:   '#D5FD44',
  SPEAKING:  '#fb923c',
  WRITING:   '#AE00FF',
}
const SECTION_SUBTLE: Record<string, string> = {
  LISTENING: 'rgba(4,255,136,0.10)',
  READING:   'rgba(213,253,68,0.10)',
  SPEAKING:  'rgba(251,146,60,0.12)',
  WRITING:   'rgba(174,0,255,0.10)',
}
const SECTION_ICON: Record<string, React.ElementType> = {
  LISTENING: Headphones,
  READING:   BookOpen,
  SPEAKING:  Mic,
  WRITING:   PenLine,
}

const PART_LINKS: Record<number, string> = {
  1: '/listening', 2: '/listening', 3: '/listening', 4: '/listening',
  5: '/practice/part5', 6: '/practice/part6', 7: '/practice/part7',
}
const PART_LABEL: Record<number, string> = {
  1: 'Part 1 – Photograph',
  2: 'Part 2 – Question-Response',
  3: 'Part 3 – Conversation',
  4: 'Part 4 – Talk',
  5: 'Part 5 – Incomplete Sentence',
  6: 'Part 6 – Text Completion',
  7: 'Part 7 – Reading Comprehension',
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

interface DayPlan {
  day: string
  focus: { section: string; part: number; label: string; link: string; reason: string }[]
  restDay: boolean
  durationMin: number
}

function buildStudyPlan(params: {
  examType: string | null
  daysUntilExam: number | null
  progByPart: Record<number, { accuracy: number; sampleSize: number }>
  levels: { section: string; cefr: string; score: number }[]
  diagnosticDone: boolean
}): { plan: DayPlan[]; advice: string; targetScore: string } {
  const { examType, daysUntilExam, progByPart, levels, diagnosticDone } = params

  // Determine active sections
  const sections: Section[] = examType === 'LISTENING_READING'
    ? ['LISTENING', 'READING']
    : examType === 'SPEAKING_WRITING'
      ? ['SPEAKING', 'WRITING']
      : ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

  // Determine READING parts to practice
  const readingParts = [5, 6, 7]
  const partsByAccuracy = readingParts
    .filter(p => progByPart[p])
    .sort((a, b) => (progByPart[a]?.accuracy ?? 1) - (progByPart[b]?.accuracy ?? 1))
  const unpracticed = readingParts.filter(p => !progByPart[p])

  // How hard to study
  const intensity = daysUntilExam === null
    ? 'normal'
    : daysUntilExam <= 7
      ? 'intensive'
      : daysUntilExam <= 30
        ? 'focused'
        : 'normal'

  const durationByIntensity = { intensive: 60, focused: 45, normal: 30 }
  const durationMin = durationByIntensity[intensity]

  // CEFR-based target score
  const readingLevel = levels.find(l => l.section === 'READING')
  const listeningLevel = levels.find(l => l.section === 'LISTENING')
  const cefrToScore: Record<string, number> = { A1: 200, A2: 300, B1: 450, B2: 600, C1: 750, C2: 900 }
  const targetScore = readingLevel || listeningLevel
    ? `${Math.min(990, (cefrToScore[readingLevel?.cefr ?? 'B1'] ?? 450) + (cefrToScore[listeningLevel?.cefr ?? 'B1'] ?? 450))} Punkte`
    : '600+ Punkte'

  function getPriority(section: Section, part: number): string {
    const acc = progByPart[part]?.accuracy
    if (acc === undefined) return 'Noch nicht geübt — starte hier'
    if (acc < 0.5)  return `Schwacher Bereich — Genauigkeit: ${Math.round(acc * 100)}%`
    if (acc < 0.7)  return `Ausbaufähig — Genauigkeit: ${Math.round(acc * 100)}%`
    if (acc < 0.85) return `Gutes Niveau — weiter verbessern (${Math.round(acc * 100)}%)`
    return `Stark — ${Math.round(acc * 100)}% — Prüfungsniveau halten`
  }

  // Build 7-day plan
  const plan: DayPlan[] = DAYS.map((day, i) => {
    // Rest day: Sunday if normal/focused, no rest day if intensive
    if (intensity === 'normal' && i === 6) {
      return { day, focus: [], restDay: true, durationMin: 0 }
    }
    if (intensity === 'focused' && i === 6) {
      return { day, focus: [], restDay: true, durationMin: 0 }
    }

    const focus: DayPlan['focus'] = []

    // Rotate through sections and parts based on day
    if (sections.includes('READING') || sections.includes('LISTENING')) {
      const dayParts = intensity === 'intensive'
        ? [readingParts[i % 3], readingParts[(i + 1) % 3]]
        : [readingParts[i % 3]]

      for (const part of dayParts) {
        if (part === undefined) continue
        focus.push({
          section: 'READING',
          part,
          label: PART_LABEL[part],
          link: PART_LINKS[part],
          reason: getPriority('READING', part),
        })
      }
    }

    if (sections.includes('LISTENING')) {
      const lPart = [1, 2, 3, 4][i % 4]
      focus.push({
        section: 'LISTENING',
        part: lPart,
        label: PART_LABEL[lPart],
        link: PART_LINKS[lPart],
        reason: 'Hörverstehen täglich üben',
      })
    }

    if (sections.includes('SPEAKING') && i % 2 === 0) {
      focus.push({ section: 'SPEAKING', part: 1, label: 'Speaking Practice', link: '/speaking', reason: 'Regelmäßiges Sprechen verbessert Fluency' })
    }
    if (sections.includes('WRITING') && i % 2 === 1) {
      focus.push({ section: 'WRITING', part: 1, label: 'Writing Practice', link: '/writing', reason: 'Strukturiertes Schreiben üben' })
    }

    return { day, focus, restDay: false, durationMin }
  })

  // Prioritize weakest parts: move them to first days
  if (partsByAccuracy.length > 0) {
    const weakestPart = partsByAccuracy[0]
    const weakDay = plan.find(d => !d.restDay && d.focus.some(f => f.part === weakestPart))
    if (weakDay) {
      const weakFocus = weakDay.focus.find(f => f.part === weakestPart)!
      weakFocus.reason = `⚡ Priorität! ${weakFocus.reason}`
    }
  }
  // Add unpracticed parts to first available days
  for (const part of unpracticed) {
    const targetDay = plan.find(d => !d.restDay && !d.focus.some(f => f.part === part))
    if (targetDay) {
      targetDay.focus.unshift({
        section: 'READING',
        part,
        label: PART_LABEL[part],
        link: PART_LINKS[part],
        reason: '🆕 Noch nie geübt — heute starten',
      })
    }
  }

  const adviceByIntensity = {
    intensive: 'Prüfung in weniger als 7 Tagen — intensives Training mit Fokus auf Schwächen.',
    focused:   'Gute Vorbereitung: fokussiertes Üben mit strategischen Pausen am Wochenende.',
    normal:    'Entspanntes Lerntempo: 6 Tage üben, 1 Tag Pause. Kontinuität ist der Schlüssel.',
  }

  return { plan, advice: adviceByIntensity[intensity], targetScore }
}

export default async function StudyPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { progress: true, levels: true },
  })
  if (!dbUser) redirect('/login')

  const daysUntilExam = dbUser.examDate
    ? Math.ceil((new Date(dbUser.examDate).getTime() - Date.now()) / 86400000)
    : null

  const progByPart = Object.fromEntries(dbUser.progress.map(p => [p.part, p]))

  const { plan, advice, targetScore } = buildStudyPlan({
    examType: dbUser.examType,
    daysUntilExam,
    progByPart,
    levels: dbUser.levels,
    diagnosticDone: dbUser.diagnosticDone,
  })

  const todayIndex = (new Date().getDay() + 6) % 7 // Mon=0 … Sun=6
  const todayPlan = plan[todayIndex]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Lernplan</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Personalisierter Wochenplan · {advice}</p>
      </div>

      {!dbUser.diagnosticDone && (
        <div style={{ padding: '16px 20px', marginBottom: 24, borderRadius: 12, border: '1px solid rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <p className="text-sm" style={{ color: 'var(--fg)' }}>
            Starte zuerst den Einstufungstest um deinen Lernplan zu personalisieren.
          </p>
          <Link href="/diagnostic" className="btn-primary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
            Diagnose starten
          </Link>
        </div>
      )}

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { icon: <Target size={16} style={{ color: 'var(--accent)' }} />, bg: 'var(--accent-subtle)', label: 'Ziel-Score', value: targetScore },
          { icon: <Clock size={16} style={{ color: '#fb923c' }} />, bg: 'rgba(251,146,60,0.12)', label: 'Bis zur Prüfung', value: daysUntilExam !== null ? (daysUntilExam > 0 ? `${daysUntilExam} Tage` : 'Heute!') : 'Kein Datum' },
          { icon: <CalendarDays size={16} style={{ color: '#04FF88' }} />, bg: 'rgba(4,255,136,0.10)', label: 'Lerntage / Woche', value: plan.filter(d => !d.restDay).length.toString() },
        ].map(({ icon, bg, label, value }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
            </div>
            <p className="font-bold text-xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Today highlight */}
      {!todayPlan.restDay && todayPlan.focus.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>
            Heute: <span style={{ color: 'var(--accent)' }}>{todayPlan.day}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', marginLeft: 8 }}>{todayPlan.durationMin} min</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayPlan.focus.map(f => {
              const Icon = SECTION_ICON[f.section] ?? BookOpen
              const color = SECTION_COLORS[f.section]
              const subtle = SECTION_SUBTLE[f.section]
              return (
                <Link key={`${f.section}-${f.part}`} href={f.link} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '16px 20px', borderRadius: 12, border: `1.5px solid ${color}40`, background: subtle, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="font-semibold text-sm">{f.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2 }}>{f.reason}</p>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
      {todayPlan.restDay && (
        <div style={{ padding: '24px', marginBottom: 28, borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--card)', textAlign: 'center' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🌿</p>
          <p className="font-semibold" style={{ marginBottom: 4 }}>Heute ist Ruhetag</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Erholung ist Teil des Lernprozesses. Morgen geht es weiter!</p>
        </div>
      )}

      {/* Weekly grid */}
      <h2 className="text-base font-semibold" style={{ marginBottom: 16 }}>Wochenübersicht</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.map((dayPlan, i) => {
          const isToday = i === todayIndex
          return (
            <div key={dayPlan.day} className="card" style={{ padding: '16px 20px', border: isToday ? '1.5px solid var(--accent)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <p className="font-semibold text-sm" style={{ color: isToday ? 'var(--accent)' : 'var(--fg)' }}>{dayPlan.day}</p>
                  {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Heute</span>}
                </div>
                {dayPlan.restDay ? (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>🌿 Ruhetag</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                    {dayPlan.focus.map(f => {
                      const color = SECTION_COLORS[f.section]
                      return (
                        <Link key={`${f.section}-${f.part}`} href={f.link} style={{ textDecoration: 'none' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                            background: `${color}18`, color,
                            border: `1px solid ${color}30`,
                            cursor: 'pointer',
                          }}>
                            {f.section === 'READING' ? `Part ${f.part}` : f.section}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
                {!dayPlan.restDay && (
                  <p className="text-xs" style={{ color: 'var(--muted)', flexShrink: 0 }}>{dayPlan.durationMin} min</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="card" style={{ padding: '22px 24px', marginTop: 28 }}>
        <h2 className="font-semibold text-sm" style={{ marginBottom: 14 }}>
          <Zap size={14} style={{ display: 'inline', color: '#fbbf24', marginRight: 6 }} />
          Lerntipps
        </h2>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Übe jeden Tag — auch 15 Minuten sind besser als gar nichts.',
            'Beginne mit deinen schwächsten Parts und arbeite dich zu stärkeren vor.',
            'Lese nach jeder falschen Antwort die Erklärung aufmerksam durch.',
            'Wörterlisten für Part 5 helfen besonders im Bereich Wortschatz.',
            'Simuliere Prüfungsbedingungen: Timer stellen, keine Unterbrechungen.',
          ].map(tip => (
            <li key={tip} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, fontWeight: 700 }}>→</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
