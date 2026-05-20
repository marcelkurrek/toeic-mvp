import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, ChevronRight, CheckCircle2, BookOpen, Sparkles, FileEdit } from 'lucide-react'

const PART_META: Record<number, { label: string; href: string; desc: string; color: string }> = {
  5: { label: 'Part 5', href: '/practice/part5', desc: 'Grammatik & Wortschatz', color: '#22d3ee' },
  6: { label: 'Part 6', href: '/practice/part6', desc: 'Textergänzung',          color: '#4ade80' },
  7: { label: 'Part 7', href: '/practice/part7', desc: 'Leseverständnis',         color: '#fb923c' },
}

function AccuracyBar({ pct, color }: { pct: number; color: string }) {
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

export default async function WeakPartsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { progress: { where: { section: 'READING' } } },
  })

  const progByPart = Object.fromEntries((dbUser?.progress ?? []).map(p => [p.part, p]))

  // Sort parts: weak first (accuracy < 0.6), then medium (< 0.8), then strong
  const parts = [5, 6, 7].map(part => {
    const prog = progByPart[part]
    const pct = prog ? Math.round(prog.accuracy * 100) : null
    return { part, prog, pct }
  }).sort((a, b) => {
    const aVal = a.pct ?? 50
    const bVal = b.pct ?? 50
    return aVal - bVal
  })

  const weakParts   = parts.filter(p => p.pct !== null && p.pct < 60)
  const mediumParts = parts.filter(p => p.pct !== null && p.pct >= 60 && p.pct < 80)
  const strongParts = parts.filter(p => p.pct !== null && p.pct >= 80)
  const newParts    = parts.filter(p => p.pct === null)

  const topWeak = parts.find(p => p.pct !== null && p.pct < 60)
  const hasAnyProgress = parts.some(p => p.pct !== null)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginTop: 10, marginBottom: 6 }}>Schwache Parts</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Bereiche mit dem größten Verbesserungspotenzial</p>
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
            {[5, 6, 7].map(p => (
              <Link key={p} href={PART_META[p].href} className="btn-primary" style={{ fontSize: 13 }}>
                Part {p} starten
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top recommendation */}
      {topWeak && (
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
                {PART_META[topWeak.part].label} — {PART_META[topWeak.part].desc}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {topWeak.pct}% Genauigkeit · noch {60 - topWeak.pct!}% bis zum Ziel (60%)
              </p>
            </div>
          </div>
          <Link href={`${PART_META[topWeak.part].href}?adaptive=true`} className="btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            Jetzt üben →
          </Link>
        </div>
      )}

      {/* All parts breakdown */}
      {hasAnyProgress && (
        <>
          <h2 className="text-base font-semibold" style={{ marginBottom: 14 }}>Alle Parts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {parts.map(({ part, prog, pct }) => {
              const meta = PART_META[part]
              const icon = part === 5 ? <Sparkles size={16} style={{ color: meta.color }} />
                : part === 6 ? <FileEdit size={16} style={{ color: meta.color }} />
                : <BookOpen size={16} style={{ color: meta.color }} />
              const status = pct === null ? 'new' : pct >= 80 ? 'strong' : pct >= 60 ? 'medium' : 'weak'
              const statusLabel = { new: 'Neu', strong: 'Stark', medium: 'Gut', weak: 'Schwach' }[status]
              const statusColor = { new: 'var(--muted)', strong: 'var(--success)', medium: '#fbbf24', weak: 'var(--error)' }[status]
              const statusBg = { new: 'var(--card-border)', strong: 'rgba(74,222,128,0.12)', medium: 'rgba(251,191,36,0.12)', weak: 'rgba(248,113,113,0.12)' }[status]

              return (
                <Link key={part} href={meta.href} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: '18px 22px',
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{meta.label} — {meta.desc}</p>
                          {prog && (
                            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{prog.sampleSize} Fragen beantwortet</p>
                          )}
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: statusBg, color: statusColor }}>
                          {statusLabel}
                        </span>
                      </div>
                      {pct !== null ? (
                        <AccuracyBar pct={pct} color={meta.color} />
                      ) : (
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Noch nicht geübt</p>
                      )}
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* Tips */}
      {weakParts.length > 0 && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm">Tipps zur Verbesserung</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weakParts.map(({ part }) => (
              <li key={part} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}>▸</span>
                {part === 5 && 'Part 5: Fokussiere auf Grammatikregeln (Tenses, Prepositions, Word Forms). 5–10 Fragen täglich.'}
                {part === 6 && 'Part 6: Übe Textzusammenhang und Diskursmarker. Lies den ganzen Absatz vor der Antwort.'}
                {part === 7 && 'Part 7: Verbessere Skimming & Scanning. Lies zuerst die Fragen, dann den Text.'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strongParts.length === 3 && (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
          <p className="font-bold" style={{ marginBottom: 6 }}>Alle Parts auf einem guten Niveau!</p>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 16 }}>Bereit für die Mini-Prüfung?</p>
          <Link href="/practice/mini-exam" className="btn-primary">Mini-Prüfung starten</Link>
        </div>
      )}
    </div>
  )
}
