'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, X } from 'lucide-react'

const SECTIONS = ['', 'LISTENING', 'READING', 'SPEAKING', 'WRITING']
const SECTION_LABELS: Record<string, string> = {
  '': 'Alle Sektionen',
  LISTENING: 'Listening',
  READING: 'Reading',
  SPEAKING: 'Speaking',
  WRITING: 'Writing',
}

export function QuestionsFilter() {
  const router     = useRouter()
  const pathname   = usePathname()
  const sp         = useSearchParams()
  const [search, setSearch] = useState(sp.get('search') ?? '')

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, sp])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    update('search', search)
  }

  function clearSearch() {
    setSearch('')
    update('search', '')
  }

  const currentSection = sp.get('section') ?? ''

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
      {/* Section filter */}
      <select
        value={currentSection}
        onChange={e => update('section', e.target.value)}
        style={{
          background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8,
          padding: '8px 12px', fontSize: 13, color: 'var(--fg)', outline: 'none', cursor: 'pointer',
        }}
      >
        {SECTIONS.map(s => (
          <option key={s} value={s}>{SECTION_LABELS[s]}</option>
        ))}
      </select>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tags, Antwort oder Erklärung suchen…"
            style={{
              width: '100%', paddingLeft: 30, paddingRight: search ? 30 : 12,
              paddingTop: 8, paddingBottom: 8,
              background: 'var(--card)', border: '1px solid var(--card-border)',
              borderRadius: 8, fontSize: 13, color: 'var(--fg)', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          Suchen
        </button>
      </form>
    </div>
  )
}
