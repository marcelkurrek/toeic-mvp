'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle } from 'lucide-react'

const SECTIONS = ['LISTENING', 'READING', 'SPEAKING', 'WRITING']

const TYPE_BY_SECTION: Record<string, string[]> = {
  LISTENING: ['PHOTOGRAPH', 'QUESTION_RESPONSE', 'CONVERSATION', 'TALK'],
  READING:   ['INCOMPLETE_SENTENCE', 'TEXT_COMPLETION', 'SINGLE_PASSAGE', 'DOUBLE_PASSAGE', 'TRIPLE_PASSAGE'],
  SPEAKING:  ['READ_ALOUD', 'DESCRIBE_PICTURE', 'RESPOND_FREE', 'RESPOND_INFO', 'EXPRESS_OPINION'],
  WRITING:   ['WRITE_SENTENCE', 'RESPOND_EMAIL', 'OPINION_ESSAY'],
}

const PART_BY_SECTION: Record<string, number[]> = {
  LISTENING: [1, 2, 3, 4],
  READING:   [5, 6, 7],
  SPEAKING:  [1, 2, 3, 4, 5],
  WRITING:   [1, 2, 3],
}

interface Props {
  initial?: {
    id?: string
    section?: string
    part?: number
    type?: string
    content?: unknown
    options?: unknown
    answer?: string
    explanation?: string
    difficulty?: number
    tags?: string[]
    isDiagnostic?: boolean
  }
  mode: 'create' | 'edit'
}

export function QuestionForm({ initial, mode }: Props) {
  const router = useRouter()
  const [section,      setSection]      = useState(initial?.section      ?? 'READING')
  const [part,         setPart]         = useState(initial?.part         ?? 5)
  const [type,         setType]         = useState(initial?.type         ?? 'INCOMPLETE_SENTENCE')
  const [contentJson,  setContentJson]  = useState(initial?.content      ? JSON.stringify(initial.content,  null, 2) : '{\n  "text": ""\n}')
  const [optionsJson,  setOptionsJson]  = useState(initial?.options      ? JSON.stringify(initial.options,  null, 2) : '{\n  "A": "",\n  "B": "",\n  "C": "",\n  "D": ""\n}')
  const [answer,       setAnswer]       = useState(initial?.answer       ?? '')
  const [explanation,  setExplanation]  = useState(initial?.explanation  ?? '')
  const [difficulty,   setDifficulty]   = useState(initial?.difficulty   ?? 3)
  const [tags,         setTags]         = useState((initial?.tags ?? []).join(', '))
  const [isDiagnostic, setIsDiagnostic] = useState(initial?.isDiagnostic ?? false)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  function handleSectionChange(s: string) {
    setSection(s)
    const types = TYPE_BY_SECTION[s] ?? []
    const parts = PART_BY_SECTION[s] ?? []
    if (types.length) setType(types[0])
    if (parts.length) setPart(parts[0])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let contentParsed: unknown
    let optionsParsed: unknown = null
    try { contentParsed = JSON.parse(contentJson) } catch { setError('Content JSON ist ungültig.'); return }
    if (optionsJson.trim() && optionsJson.trim() !== 'null') {
      try { optionsParsed = JSON.parse(optionsJson) } catch { setError('Options JSON ist ungültig.'); return }
    }

    setSaving(true)
    try {
      const url    = mode === 'create' ? '/api/admin/questions' : `/api/admin/questions/${initial?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section, part: Number(part), type,
          content: contentParsed,
          options: optionsParsed,
          answer, explanation: explanation || null,
          difficulty,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isDiagnostic,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Fehler')
      }
      router.push(`/admin/questions?section=${section}&part=${part}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 13, color: 'var(--fg)', outline: 'none',
  }
  const labelStyle = { fontSize: 11, fontWeight: 700 as const, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6, display: 'block' as const }

  const availableTypes = TYPE_BY_SECTION[section] ?? []
  const availableParts = PART_BY_SECTION[section] ?? []

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Row 1: section / part / type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Section</label>
          <select value={section} onChange={e => handleSectionChange(e.target.value)} style={inputStyle}>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Part</label>
          <select value={part} onChange={e => setPart(Number(e.target.value))} style={inputStyle}>
            {availableParts.map(p => <option key={p} value={p}>Part {p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Typ</label>
          <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
            {availableTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Content JSON */}
      <div>
        <label style={labelStyle}>Content (JSON)</label>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
          Für Part 5/6: <code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>{`{"text": "The report ___ last week."}`}</code>
        </p>
        <textarea
          value={contentJson}
          onChange={e => setContentJson(e.target.value)}
          rows={6}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
          spellCheck={false}
        />
      </div>

      {/* Options JSON */}
      <div>
        <label style={labelStyle}>Options (JSON) — leer lassen für offene Antworten</label>
        <textarea
          value={optionsJson}
          onChange={e => setOptionsJson(e.target.value)}
          rows={6}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
          spellCheck={false}
        />
      </div>

      {/* Answer */}
      <div>
        <label style={labelStyle}>Korrekte Antwort</label>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>MC: Schlüssel (z.B. "A"). Offen: Musterantwort.</p>
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} required style={inputStyle} placeholder='z.B. "A" oder "was submitted"' />
      </div>

      {/* Explanation */}
      <div>
        <label style={labelStyle}>Erklärung (optional)</label>
        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Warum ist diese Antwort korrekt?"
        />
      </div>

      {/* Row: difficulty / tags / isDiagnostic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Schwierigkeit (1–5)</label>
          <input
            type="range" min={1} max={5} value={difficulty}
            onChange={e => setDifficulty(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
            {'★'.repeat(difficulty)}{'☆'.repeat(5 - difficulty)}
          </p>
        </div>
        <div>
          <label style={labelStyle}>Tags (kommagetrennt)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="grammar, present-perfect, vocabulary" />
        </div>
        <div style={{ paddingBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={isDiagnostic} onChange={e => setIsDiagnostic(e.target.checked)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Diagnose-Frage</span>
          </label>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', fontSize: 13 }}
        >
          <Save size={14} />
          {saving ? 'Wird gespeichert…' : mode === 'create' ? 'Frage erstellen' : 'Änderungen speichern'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '11px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer' }}
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
