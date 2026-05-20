'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy, Filter } from 'lucide-react'
import { VOCAB_WORDS, CATEGORY_META, type VocabWord } from '@/lib/vocabulary'

type KnownState = Record<string, boolean | undefined>
const STORAGE_KEY = 'toeic-vocab-known'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardDeck() {
  const [known, setKnown] = useState<KnownState>({})
  const [deck, setDeck] = useState<VocabWord[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unknown' | VocabWord['category']>('all')
  const [phase, setPhase] = useState<'deck' | 'done'>('deck')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setKnown(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const buildDeck = useCallback((f: typeof filter, k: KnownState) => {
    let words = VOCAB_WORDS
    if (f === 'unknown') words = words.filter(w => !k[w.id])
    else if (f !== 'all') words = words.filter(w => w.category === f)
    return shuffle(words)
  }, [])

  useEffect(() => {
    const d = buildDeck(filter, known)
    setDeck(d)
    setIndex(0)
    setFlipped(false)
    setPhase(d.length === 0 ? 'done' : 'deck')
  }, [filter, buildDeck]) // eslint-disable-line react-hooks/exhaustive-deps

  function saveKnown(next: KnownState) {
    setKnown(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  function markCard(isKnown: boolean) {
    const card = deck[index]
    const next = { ...known, [card.id]: isKnown }
    saveKnown(next)
    if (index + 1 >= deck.length) {
      setPhase('done')
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  function restart() {
    const d = buildDeck(filter, known)
    setDeck(d)
    setIndex(0)
    setFlipped(false)
    setPhase(d.length === 0 ? 'done' : 'deck')
  }

  function resetAll() {
    saveKnown({})
    const d = buildDeck('all', {})
    setFilter('all')
    setDeck(d)
    setIndex(0)
    setFlipped(false)
    setPhase('deck')
  }

  const knownCount = VOCAB_WORDS.filter(w => known[w.id] === true).length
  const totalCount = VOCAB_WORDS.length
  const unknownCount = VOCAB_WORDS.filter(w => !known[w.id]).length
  const card = deck[index]

  const DIFF_COLORS = { 1: '#4ade80', 2: '#fbbf24', 3: '#f87171' }
  const DIFF_LABELS = { 1: 'Einfach', 2: 'Mittel', 3: 'Schwer' }

  return (
    <div>
      {/* Stats bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Gelernt</p>
          <p className="font-bold text-xl" style={{ color: 'var(--success)' }}>{knownCount} / {totalCount}</p>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: 'var(--success)', width: `${knownCount / totalCount * 100}%`, transition: 'width 0.3s' }} />
          </div>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{Math.round(knownCount / totalCount * 100)}% Fortschritt</p>
        </div>
        <button onClick={resetAll} style={{ background: 'none', border: '1px solid var(--card-border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RotateCcw size={12} /> Alles zurücksetzen
        </button>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        {[
          { key: 'all' as const, label: `Alle (${totalCount})` },
          { key: 'unknown' as const, label: `Unbekannt (${unknownCount})` },
          ...Object.entries(CATEGORY_META).map(([k, v]) => ({
            key: k as VocabWord['category'],
            label: `${v.icon} ${v.label}`,
          })),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', border: 'none',
              background: filter === key ? 'var(--accent)' : 'var(--card-border)',
              color: filter === key ? '#fff' : 'var(--fg)',
              fontWeight: filter === key ? 600 : 400,
              transition: 'background 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Done state */}
      {phase === 'done' && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Trophy size={40} style={{ color: '#fbbf24', margin: '0 auto 16px' }} />
          <h2 className="font-bold text-xl" style={{ marginBottom: 8 }}>Deck abgeschlossen!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {filter === 'unknown' && unknownCount === 0
              ? 'Du hast alle Vokabeln gelernt! 🎉'
              : `Du hast alle ${deck.length} Karten in diesem Deck durchgegangen.`}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={restart} className="btn-primary">Deck neu mischen</button>
            <button onClick={() => setFilter('unknown')} className="btn-secondary">Nur Unbekannte</button>
          </div>
        </div>
      )}

      {/* Flashcard */}
      {phase === 'deck' && card && (
        <div>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{index + 1} / {deck.length}</p>
            <div style={{ display: 'flex', gap: 3 }}>
              {deck.map((_, i) => (
                <div key={i} style={{ width: 28, height: 3, borderRadius: 99, background: i < index ? 'var(--success)' : i === index ? 'var(--accent)' : 'var(--card-border)', transition: 'background 0.2s' }} />
              ))}
            </div>
          </div>

          {/* Card */}
          <div
            onClick={() => setFlipped(f => !f)}
            className="card"
            style={{
              minHeight: 280, padding: '40px 36px', marginBottom: 20,
              cursor: 'pointer', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', userSelect: 'none',
              background: flipped ? 'var(--accent-subtle)' : undefined,
              border: flipped ? '1.5px solid var(--accent)' : undefined,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {/* Category + difficulty badge */}
            <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', gap: 8 }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                background: `${CATEGORY_META[card.category].color}20`,
                color: CATEGORY_META[card.category].color,
              }}>
                {CATEGORY_META[card.category].icon} {CATEGORY_META[card.category].label}
              </span>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                background: `${DIFF_COLORS[card.difficulty]}20`,
                color: DIFF_COLORS[card.difficulty],
              }}>
                {DIFF_LABELS[card.difficulty]}
              </span>
            </div>

            {!flipped ? (
              <>
                <p className="font-bold" style={{ fontSize: 32, marginBottom: 8, letterSpacing: '-0.01em' }}>{card.word}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Tippe um die Übersetzung zu sehen</p>
              </>
            ) : (
              <>
                <p className="font-bold" style={{ fontSize: 24, marginBottom: 12, color: 'var(--accent)' }}>{card.translation}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 440, fontStyle: 'italic' }}>
                  &ldquo;{card.example}&rdquo;
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>Kanntest du dieses Wort?</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => markCard(false)}
              disabled={!flipped}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, cursor: flipped ? 'pointer' : 'not-allowed',
                border: '1.5px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.07)',
                color: flipped ? 'var(--error)' : 'var(--card-border)', fontWeight: 600, fontSize: 14,
                opacity: flipped ? 1 : 0.4, transition: 'opacity 0.15s',
              }}
            >
              <XCircle size={18} /> Noch nicht
            </button>

            <button
              onClick={() => setFlipped(f => !f)}
              style={{
                width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
                border: '1px solid var(--card-border)', background: 'var(--card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
              }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => markCard(true)}
              disabled={!flipped}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, cursor: flipped ? 'pointer' : 'not-allowed',
                border: '1.5px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.07)',
                color: flipped ? 'var(--success)' : 'var(--card-border)', fontWeight: 600, fontSize: 14,
                opacity: flipped ? 1 : 0.4, transition: 'opacity 0.15s',
              }}
            >
              <CheckCircle size={18} /> Gewusst
            </button>
          </div>

          {/* Navigation hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button
              onClick={() => { if (index > 0) { setIndex(i => i - 1); setFlipped(false) } }}
              disabled={index === 0}
              style={{ background: 'none', border: 'none', cursor: index > 0 ? 'pointer' : 'not-allowed', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: index > 0 ? 1 : 0.3 }}
            >
              <ChevronLeft size={14} /> Zurück
            </button>
            <button
              onClick={() => { if (index < deck.length - 1) { setIndex(i => i + 1); setFlipped(false) } }}
              disabled={index >= deck.length - 1}
              style={{ background: 'none', border: 'none', cursor: index < deck.length - 1 ? 'pointer' : 'not-allowed', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: index < deck.length - 1 ? 1 : 0.3 }}
            >
              Überspringen <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
