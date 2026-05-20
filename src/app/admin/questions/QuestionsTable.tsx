'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

interface QuestionRow {
  id: string
  section: string
  part: number
  type: string
  difficulty: number
  isDiagnostic: boolean
  tags: string[]
  answer: string
  explanation: string | null
  createdAt: string
  _count: { answers: number }
}

interface Props {
  questions: QuestionRow[]
  total: number
  page: number
  pages: number
  section: string
  part: number
  search?: string
  sectionColors: Record<string, string>
}

export function QuestionsTable({ questions, total, page, pages, section, part, search, sectionColors }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Frage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('Löschen fehlgeschlagen.')
    } finally {
      setDeletingId(null)
    }
  }

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (section) params.set('section', section)
    if (part)    params.set('part', String(part))
    if (search)  params.set('search', search)
    if (p > 1)   params.set('page', String(p))
    const q = params.toString()
    return `/admin/questions${q ? `?${q}` : ''}`
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 className="text-base font-semibold">
            {section && <span style={{ color: sectionColors[section] ?? 'var(--accent)' }}>{section}</span>}
            {part > 0 && <span style={{ color: 'var(--muted)' }}> · Part {part}</span>}
            {search && <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 13 }}> · Suche: „{search}"</span>}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{total} Fragen</p>
        </div>
        <Link href="/admin/questions" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Alle anzeigen
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['Section / Part', 'Typ', 'Schwierigk.', 'Antwort', 'Nutzungen', 'Tags', ''].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: i < questions.length - 1 ? '1px solid var(--card-border)' : 'none', opacity: deletingId === q.id ? 0.4 : 1 }}>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${sectionColors[q.section] ?? 'var(--accent)'}20`, color: sectionColors[q.section] ?? 'var(--accent)' }}>
                    {q.section}
                  </span>
                  <span style={{ marginLeft: 6, color: 'var(--muted)', fontSize: 11 }}>P{q.part}</span>
                  {q.isDiagnostic && (
                    <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>DIAG</span>
                  )}
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--muted)', fontSize: 11 }}>
                  {q.type.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(d => (
                      <div key={d} style={{ width: 6, height: 6, borderRadius: 99, background: d <= q.difficulty ? 'var(--accent)' : 'var(--card-border)' }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '11px 14px', fontWeight: 700, fontSize: 13, color: 'var(--success)' }}>
                  {q.answer.length > 20 ? q.answer.slice(0, 20) + '…' : q.answer}
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>
                  {q._count.answers}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  {q.tags.length > 0 ? (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {q.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 99, background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : <span style={{ color: 'var(--card-border)' }}>—</span>}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 6, border: '1px solid var(--card-border)', color: 'var(--muted)', textDecoration: 'none' }}
                    >
                      <Pencil size={11} />
                    </Link>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {questions.length === 0 && (
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Keine Fragen gefunden.</p>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {page > 1 && (
            <Link href={buildHref(page - 1)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: '1px solid var(--card-border)', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Zurück
            </Link>
          )}
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Seite {page} von {pages}</span>
          {page < pages && (
            <Link href={buildHref(page + 1)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: '1px solid var(--card-border)', color: 'var(--muted)', textDecoration: 'none' }}>
              Weiter →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
