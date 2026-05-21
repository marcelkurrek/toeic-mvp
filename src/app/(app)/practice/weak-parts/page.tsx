import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, ChevronRight, CheckCircle2, BookOpen, Sparkles, FileEdit, Headphones, MessageSquare, Users, Radio } from 'lucide-react'

// ── Meta for all 7 L+R parts ─────────────────────────────────────────────────

const LISTENING_META: Record<number, { label: string; href: string; desc: string; color: string; icon: React.ReactNode }> = {
  1: { label: 'Part 1', href: '/practice/part1', desc: 'Fotos beschreiben',  color: '#04FF88', icon: <Headphones size={16} style={{ color: '#04FF88' }} /> },
  2: { label: 'Part 2', href: '/practice/part2', desc: 'Frage & Antwort',    color: '#04FF88', icon: <MessageSquare size={16} style={{ color: '#04FF88' }} /> },
  3: { label: 'Part 3', href: '/practice/part3', desc: 'Gespräche',          color: '#04FF88', icon: <Users size={16} style={{ color: '#04FF88' }} /> },
  4: { label: 'Part 4', href: '/practice/part4', desc: 'Monologe',           color: '#04FF88', icon: <Radio size={16} style={{ color: '#04FF88' }} /> },
}

const READING_META: Record<number, { label: string; href: string; desc: string; color: string; icon: React.ReactNode }> = {
  5: { label: 'Part 5', href: '/practice/part5', desc: 'Grammatik & Wortschatz', color: '#D5FD44', icon: <Sparkles size={16} style={{ color: '#D5FD44' }} /> },
  6: { label: 'Part 6', href: '/practice/part6', desc: 'Textergänzung',          color: '#D5FD44', icon: <FileEdit size={16} style={{ color: '#D5FD44' }} /> },
  7: { label: 'Part 7', href: '/practice/part7', desc: 'Leseverständnis',         color: '#D5FD44', icon: <BookOpen size={16} style={{ color: '#D5FD44' }} /> },
}

// ── Shared sub-components ────────────────────────────────────────────────────

function AccuracyBar({ pct }: { pct: number }) {
  const barColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#fbbf24' : 'var(--error)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Genauigkeit</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${pct}%`, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function PartCard({
  partNum, meta, pct, sampleSize,
}: {
  partNum: number
  meta: { label: string; href: string; desc: string; color: string; icon: React.ReactNode }
  pct: number | null
  sampleSize: number
}) {
  const status = pct === null ? 'new' : pct >= 80 ? 'strong' : pct >= 60 ? 'medium' : 'weak'
  const statusLabel = { new: 'Neu', strong: 'Stark', medium: 'Gut', weak: 'Schwach' }[status]
  const statusColor = { new: 'var(--muted)', strong: 'var(--success)', medium: '#fbbf24', weak: 'var(--error)' }[status]
  const statusBg    = { new: 'var(--card-border)', strong: 'rgba(74,222,128,0.12)', medium: 'rgba(251,191,36,0.12)', weak: 'rgba(248,113,113,0.12)' }[status]
  void partNum

  return (
    <Link href={meta.href} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {meta.icon}
            </div>
            <div>
              <p className="font-semibold text-sm">{meta.label} — {meta.desc}</p>
              {sampleSize > 0 && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sampleSize} Fragen beantwortet</p>}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: statusBg, color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          {pct !== null ? <AccuracyBar pct={pct} /> : <p style={{ fontSize: 12, color: 'var(--muted)' }}>Noch nicht geübt</p>}
        </div>
        <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      </div>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function WeakPartsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      progress: { where: { section: { in: ['LISTENING', 'READING'] } } },
    },
  })

  const lProgress = (dbUser?.progress ?? []).filter(p => p.section === 'LISTENING')
  const rProgress = (dbUser?.progress ?? []).filter(p => p.section === 'READING')

  const lProgByPart = Object.fromEntries(lProgress.map(p => [p.part, p]))
  const rProgByPart = Object.fromEntries(rProgress.map(p => [p.part, p]))

  // Build sorted part lists: weak first, then medium, then strong, then new
  type PartEntry = { partNum: number; pct: number | null; sampleSize: number }

  const lParts: PartEntry[] = [1, 2, 3, 4].map(n => ({
    partNum: n,
    pct: lProgByPart[n] ? Math.round(lProgByPart[n].accuracy * 100) : null,
    sampleSize: lProgByPart[n]?.sampleSize ?? 0,
  })).sort((a, b) => (a.pct ?? 50) - (b.pct ?? 50))

  const rParts: PartEntry[] = [5, 6, 7].map(n => ({
    partNum: n,
    pct: rProgByPart[n] ? Math.round(rProgByPart[n].accuracy * 100) : null,
    sampleSize: rProgByPart[n]?.sampleSize ?? 0,
  })).sort((a, b) => (a.pct ?? 50) - (b.pct ?? 50))

  // Top priority: weakest part across all sections combined
  const allParts = [...lParts, ...rParts]
  const topWeak = allParts.find(p => p.pct !== null && p.pct < 60)
  const topWeakMeta = topWeak
    ? (topWeak.partNum <= 4 ? LISTENING_META[topWeak.partNum] : READING_META[topWeak.partNum])
    : null

  const hasAnyProgress = allParts.some(p => p.pct !== null)
  const lStrong = lParts.filter(p => p.pct !== null && p.pct >= 80).length
  const rStrong = rParts.filter(p => p.pct !== null && p.pct >= 80).length
  const allStrong = lStrong === 4 && rStrong === 3

  const lWeak = lParts.filter(p => p.pct !== null && p.pct < 60)
  const rWeak = rParts.filter(p => p.pct !== null && p.pct < 60)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginTop: 10, marginBottom: 6 }}>Schwache Parts</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Listening & Reading — Bereiche mit dem größten Verbesserungspotenzial</p>
      </div>

      {/* No progress yet */}
      {!hasAnyProgress && (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center', marginBottom: 28 }}>
          <BookOpen size={36} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
          <h3 className="font-semibold" style={{ marginBottom: 8 }}>Noch keine Übungsdaten</h3>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Übe mindestens einen Part, damit das System deine Stärken und Schwächen analysieren kann.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(p => {
              const meta = p <= 4 ? LISTENING_META[p] : READING_META[p]
              return (
                <Link key={p} href={meta.href} className="btn-primary" style={{ fontSize: 13 }}>
                  {meta.label} starten
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Top recommendation */}
      {topWeak && topWeakMeta && (
        <div style={{
          padding: '22px 26px', borderRadius: 14, marginBottom: 24,
          background: 'rgba(248,113,113,0.07)', border: '1.5px solid rgba(248,113,113,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--error)', marginBottom: 3 }}>Priorität Nr. 1</p>
              <p className="font-bold" style={{ fontSize: 16, marginBottom: 2 }}>
                {topWeakMeta.label} — {topWeakMeta.desc}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {topWeak.pct}% Genauigkeit · noch {60 - topWeak.pct!}% bis zum Ziel (60%)
              </p>
            </div>
          </div>
          <Link href={`${topWeakMeta.href}?adaptive=true`} className="btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            Jetzt üben →
          </Link>
        </div>
      )}

      {/* Listening section */}
      {hasAnyProgress && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 8 }}>
            <Headphones size={15} style={{ color: '#04FF88' }} />
            <h2 className="text-base font-semibold">Listening — Parts 1–4</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{lStrong}/4 stark</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {lParts.map(({ partNum, pct, sampleSize }) => (
              <PartCard key={partNum} partNum={partNum} meta={LISTENING_META[partNum]} pct={pct} sampleSize={sampleSize} />
            ))}
          </div>

          {/* Reading section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BookOpen size={15} style={{ color: '#D5FD44' }} />
            <h2 className="text-base font-semibold">Reading — Parts 5–7</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{rStrong}/3 stark</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {rParts.map(({ partNum, pct, sampleSize }) => (
              <PartCard key={partNum} partNum={partNum} meta={READING_META[partNum]} pct={pct} sampleSize={sampleSize} />
            ))}
          </div>
        </>
      )}

      {/* Tips for weak parts */}
      {(lWeak.length > 0 || rWeak.length > 0) && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm">Tipps zur Verbesserung</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lWeak.map(({ partNum }) => (
              <li key={partNum} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}>▸</span>
                {partNum === 1 && 'Part 1: Analysiere Fotos nach dem 6-Dimensionen-Framework: Anzahl, Geschlecht, Ort, Aussehen, Aktion, Beruf. Achte auf Präpositionen (next to, in front of, on top of).'}
                {partNum === 2 && 'Part 2: Erkenne Fragentypen (Suggestion/Offer/Request) und meide Sound-alike-Fallen. Richtige Antwort muss die Frage inhaltlich beantworten — nicht nur thematisch passen.'}
                {partNum === 3 && 'Part 3: Fragen vor dem Audio lesen. Wer spricht, wo, warum? Grafik-Fragen: Tabelle zuerst scannen. Antworten sind Paraphrasen — kein direktes Zitat.'}
                {partNum === 4 && 'Part 4: Zuerst alle 3 Fragen lesen, dann dem Talk folgen. Zahlen-Fallen beachten (13 vs. 30, 15 vs. 50). Implizierte Bedeutung aus dem Kontext erschließen.'}
              </li>
            ))}
            {rWeak.map(({ partNum }) => (
              <li key={partNum} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}>▸</span>
                {partNum === 5 && 'Part 5: Fokussiere auf Grammatikregeln (Tenses, Prepositions, Word Forms). Wortformfragen (noun/verb/adj/adv) anhand der Satzposition lösen. 5–10 Fragen täglich.'}
                {partNum === 6 && 'Part 6: Übe Textzusammenhang und Diskursmarker. Lies den ganzen Absatz vor der Antwort. Bei Füllsätzen: passt er logisch zum vorherigen und nächsten Satz?'}
                {partNum === 7 && 'Part 7: PSRA-Strategie: Zuerst Fragen lesen (Predict+Scan), dann Text (Read), dann antworten (Answer). Bei Mehrfachtexten: in welchem Text liegt die Antwort?'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All strong */}
      {allStrong && (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <p className="font-bold" style={{ marginBottom: 6 }}>Alle L+R Parts auf einem guten Niveau!</p>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 16 }}>Bereit für die Vollprüfung?</p>
          <Link href="/practice/full-exam" className="btn-primary">TOEIC Vollprüfung starten</Link>
        </div>
      )}
    </div>
  )
}
