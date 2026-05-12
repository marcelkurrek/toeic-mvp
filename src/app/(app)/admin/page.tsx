'use client'
import { useState } from 'react'
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, XCircle, ChevronRight, Database, Zap } from 'lucide-react'
import { TOEIC_FORMAT, TOEIC_VERSION, TOEIC_LAST_CHECKED } from '@/lib/toeic-config'

// ── Task definitions per section ─────────────────────────────────────────────
const TASKS: Record<string, Array<{ label: string; part: number; type: string; description: string }>> = {
  LISTENING: [
    { label: 'Part 1 – Photographs', part: 1, type: 'PHOTOGRAPH', description: '6 per exam' },
    { label: 'Part 2 – Question-Response', part: 2, type: 'QUESTION_RESPONSE', description: '25 per exam' },
    { label: 'Part 3 – Conversations', part: 3, type: 'CONVERSATION', description: '13 conv × 3 = 39' },
    { label: 'Part 4 – Short Talks', part: 4, type: 'TALK', description: '10 talks × 3 = 30' },
  ],
  READING: [
    { label: 'Part 5 – Incomplete Sentences', part: 5, type: 'INCOMPLETE_SENTENCE', description: '30 per exam' },
    { label: 'Part 6 – Text Completion', part: 6, type: 'TEXT_COMPLETION', description: '4 texts × 4 = 16' },
    { label: 'Part 7 – Single Passage', part: 7, type: 'SINGLE_PASSAGE', description: '10 passages ≈ 29 q' },
    { label: 'Part 7 – Double Passage', part: 7, type: 'DOUBLE_PASSAGE', description: '2 sets × 5 = 10 q' },
    { label: 'Part 7 – Triple Passage', part: 7, type: 'TRIPLE_PASSAGE', description: '3 sets × 5 = 15 q' },
  ],
  SPEAKING: [
    { label: 'Q1-2 – Read Aloud', part: 1, type: 'READ_ALOUD', description: '45s prep / 45s speak · 0-3' },
    { label: 'Q3-4 – Describe a Picture', part: 2, type: 'DESCRIBE_PICTURE', description: '30s prep / 45s speak · 0-3' },
    { label: 'Q5-7 – Respond to Questions', part: 3, type: 'RESPOND_FREE', description: '15/15/30s · 0-3' },
    { label: 'Q8-10 – Respond using Info', part: 4, type: 'RESPOND_INFO', description: '45s read · 15/15/30s · 0-3' },
    { label: 'Q11 – Express Opinion', part: 5, type: 'EXPRESS_OPINION', description: '45s prep / 60s speak · 0-5' },
    { label: 'Propose a Solution (legacy)', part: 6, type: 'PROPOSE_SOLUTION', description: 'Removed Aug 2021 · extra practice only' },
  ],
  WRITING: [
    { label: 'Q1-5 – Write a Sentence', part: 1, type: 'WRITE_SENTENCE', description: '8 min / 5 questions · 0-3' },
    { label: 'Q6-7 – Respond to Email', part: 2, type: 'RESPOND_EMAIL', description: '10 min each · 0-4' },
    { label: 'Q8 – Opinion Essay', part: 3, type: 'OPINION_ESSAY', description: '30 min / ≥300 words · 0-5' },
  ],
}

const SECTION_COLORS: Record<string, string> = {
  LISTENING: '#22d3ee',
  READING:   '#4ade80',
  SPEAKING:  '#fb923c',
  WRITING:   '#a78bfa',
}

type Tab = 'generate' | 'updates'
type Finding = { area: string; description: string; severity: string; confidence: string; source?: string }

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('generate')

  // Generate state
  const [section, setSection] = useState('READING')
  const [taskIdx, setTaskIdx] = useState(0)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ count: number; questions: unknown[] } | null>(null)
  const [genError, setGenError] = useState<string | null>(null)

  // Update state
  const [checking, setChecking] = useState(false)
  const [updateResult, setUpdateResult] = useState<{
    checkedAt: string; hasChanges: boolean; findings: Finding[]; saved: boolean
  } | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const tasks = TASKS[section] ?? []
  const currentTask = tasks[Math.min(taskIdx, tasks.length - 1)]
  const color = SECTION_COLORS[section]

  async function handleGenerate() {
    if (!currentTask) return
    setGenerating(true)
    setResult(null)
    setGenError(null)
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          part: currentTask.part,
          type: currentTask.type,
          count,
          difficulty,
          saveToDb: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data)
    } catch (e) {
      setGenError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  async function handleCheckUpdates() {
    setChecking(true)
    setUpdateResult(null)
    setUpdateError(null)
    try {
      const res = await fetch('/api/toeic-updates', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setUpdateResult(data)
    } catch (e) {
      setUpdateError(String(e))
    } finally {
      setChecking(false)
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Admin</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          KI-Fragengenerierung und TOEIC-Format-Updates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: 24 }}>
        {([['generate', 'Fragen generieren', Sparkles], ['updates', 'TOEIC Updates', RefreshCw]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: tab === id ? 'var(--accent)' : 'var(--card)',
              color: tab === id ? '#fff' : 'var(--muted)',
              border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--card-border)'}`,
              cursor: 'pointer',
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── GENERATE TAB ─────────────────────────────────────────────────── */}
      {tab === 'generate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Section selector */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <p className="text-sm font-semibold" style={{ marginBottom: 12 }}>1. Section</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(TASKS).map(s => (
                <button key={s} onClick={() => { setSection(s); setTaskIdx(0); setResult(null) }}
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: section === s ? SECTION_COLORS[s] + '20' : 'var(--surface)',
                    color: section === s ? SECTION_COLORS[s] : 'var(--muted)',
                    border: `1px solid ${section === s ? SECTION_COLORS[s] + '60' : 'var(--card-border)'}`,
                    cursor: 'pointer',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Task selector */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <p className="text-sm font-semibold" style={{ marginBottom: 12 }}>2. Aufgabentyp</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((t, i) => (
                <button key={i} onClick={() => { setTaskIdx(i); setResult(null) }}
                  className="flex items-center justify-between text-left rounded-xl px-4 py-3"
                  style={{
                    background: taskIdx === i ? color + '15' : 'var(--surface)',
                    border: `1px solid ${taskIdx === i ? color + '50' : 'var(--card-border)'}`,
                    cursor: 'pointer',
                  }}>
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.description}</p>
                  </div>
                  {taskIdx === i && <ChevronRight size={14} style={{ color, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Count + Difficulty */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <p className="text-sm font-semibold" style={{ marginBottom: 16 }}>3. Menge & Schwierigkeit</p>
            <div className="flex gap-6 flex-wrap">
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Anzahl Fragen</p>
                <div className="flex gap-2">
                  {[3, 5, 10, 20].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className="w-10 h-10 rounded-xl text-sm font-semibold"
                      style={{
                        background: count === n ? color + '20' : 'var(--surface)',
                        color: count === n ? color : 'var(--muted)',
                        border: `1px solid ${count === n ? color + '50' : 'var(--card-border)'}`,
                        cursor: 'pointer',
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Schwierigkeit</p>
                <div className="flex gap-2">
                  {[
                    [1, 'A1'], [2, 'A2'], [3, 'B1'], [4, 'B2'], [5, 'C1'],
                  ].map(([n, label]) => (
                    <button key={n} onClick={() => setDifficulty(n as number)}
                      className="px-3 h-10 rounded-xl text-xs font-semibold"
                      style={{
                        background: difficulty === n ? color + '20' : 'var(--surface)',
                        color: difficulty === n ? color : 'var(--muted)',
                        border: `1px solid ${difficulty === n ? color + '50' : 'var(--card-border)'}`,
                        cursor: 'pointer',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={generating || !currentTask}
            className="btn-primary flex items-center gap-2"
            style={{ alignSelf: 'flex-start', opacity: generating ? 0.6 : 1 }}>
            {generating
              ? <><RefreshCw size={15} className="animate-spin" />Generiere...</>
              : <><Sparkles size={15} />Fragen generieren & speichern</>}
          </button>

          {/* Error */}
          {genError && (
            <div className="card" style={{ padding: '16px 20px', borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.07)' }}>
              <div className="flex items-start gap-3">
                <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ marginBottom: 4 }}>Fehler</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{genError}</p>
                  {genError.includes('ANTHROPIC_API_KEY') && (
                    <p className="text-xs" style={{ color: 'var(--warning)', marginTop: 8 }}>
                      → Füge <code>ANTHROPIC_API_KEY=sk-ant-...</code> zur <code>.env</code> Datei hinzu und starte den Server neu.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="card" style={{ padding: '16px 20px', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.07)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <p className="text-sm font-semibold">
                  {result.count} Fragen generiert und in der Datenbank gespeichert
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Database size={13} style={{ color: 'var(--muted)' }} />
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Verfügbar unter: {section.charAt(0) + section.slice(1).toLowerCase()} → {currentTask?.label}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── UPDATES TAB ──────────────────────────────────────────────────── */}
      {tab === 'updates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Current status */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <p className="text-sm font-semibold" style={{ marginBottom: 16 }}>Aktueller TOEIC Format-Stand</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                ['Format-Version', TOEIC_VERSION],
                ['Zuletzt geprüft', TOEIC_LAST_CHECKED],
                ['Listening', '100 Fragen · 45 min'],
                ['Reading', '100 Fragen · 75 min'],
                ['Speaking', '11 Aufgaben · ~20 min · 0-200'],
                ['Writing', '8 Aufgaben · 60 min · 0-200'],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
                  <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {/* Key change note */}
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--orange)', marginBottom: 4 }}>Wichtige Änderung Aug 2021</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                "Propose a Solution" (ehemals Q10) wurde aus dem offiziellen TOEIC Speaking Test entfernt.
                Aktuelle Speaking-Struktur: Q1-2 Read aloud · Q3-4 Describe picture · Q5-7 Respond free · Q8-10 Respond using info · Q11 Express opinion.
              </p>
            </div>
          </div>

          {/* Check button */}
          <button onClick={handleCheckUpdates} disabled={checking}
            className="btn-primary flex items-center gap-2"
            style={{ alignSelf: 'flex-start', opacity: checking ? 0.6 : 1 }}>
            {checking
              ? <><RefreshCw size={15} className="animate-spin" />Prüfe auf Änderungen...</>
              : <><Zap size={15} />Jetzt auf Updates prüfen</>}
          </button>

          {updateError && (
            <div className="card" style={{ padding: '16px 20px', borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.07)' }}>
              <div className="flex items-start gap-3">
                <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm">{updateError}</p>
              </div>
            </div>
          )}

          {updateResult && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                {updateResult.hasChanges
                  ? <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                  : <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                <p className="text-sm font-semibold">
                  {updateResult.hasChanges
                    ? `${updateResult.findings.length} potenzielle Änderung(en) gefunden`
                    : 'Keine Änderungen gefunden — Format ist aktuell'}
                </p>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(updateResult.checkedAt).toLocaleString('de-DE')}
                </span>
              </div>

              {updateResult.findings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {updateResult.findings.map((f, i) => (
                    <div key={i} style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: f.severity === 'high' ? 'rgba(248,113,113,0.07)' : 'rgba(251,191,36,0.07)',
                      border: `1px solid ${f.severity === 'high' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        <span className="text-xs font-semibold" style={{
                          color: f.severity === 'high' ? 'var(--error)' : 'var(--warning)',
                        }}>
                          {f.severity?.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium">{f.area}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
                          Konfidenz: {f.confidence}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{f.description}</p>
                      {f.source && (
                        <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>{f.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
