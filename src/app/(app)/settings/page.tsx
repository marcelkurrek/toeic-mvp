'use client'
import { useState, useEffect } from 'react'
import { Save, User, Calendar, BookOpen } from 'lucide-react'

const EXAM_TYPES = [
  { value: 'LISTENING_READING', label: 'TOEIC Listening & Reading', desc: 'Parts 1–7, Multiple Choice' },
  { value: 'SPEAKING_WRITING',  label: 'TOEIC Speaking & Writing',  desc: 'Mündlich & schriftlich' },
  { value: 'FULL_CERTIFICATE',  label: 'TOEIC Full Certificate',     desc: 'Alle 4 Bereiche' },
]

export default function SettingsPage() {
  const [name, setName]           = useState('')
  const [examType, setExamType]   = useState('')
  const [examDate, setExamDate]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? '')
        setExamType(data.examType ?? '')
        setExamDate(data.examDate ? data.examDate.slice(0, 10) : '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          examType: examType || null,
          examDate: examDate || null,
        }),
      })
      if (!res.ok) throw new Error('Fehler beim Speichern')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 40, color: 'var(--muted)', fontSize: 14 }}>
      Einstellungen werden geladen…
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Einstellungen</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Profil und Prüfungsdetails anpassen</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Name */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold text-sm">Name</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein vollständiger Name"
            className="w-full"
            style={{
              background: 'var(--input-bg, var(--card))',
              border: '1px solid var(--card-border)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--fg)',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Exam type */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={15} style={{ color: 'var(--green)' }} />
            </div>
            <p className="font-semibold text-sm">Prüfungstyp</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXAM_TYPES.map(et => (
              <label key={et.value} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
                border: `1.5px solid ${examType === et.value ? 'var(--accent)' : 'var(--card-border)'}`,
                background: examType === et.value ? 'var(--accent-subtle)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <input type="radio" name="examType" value={et.value} checked={examType === et.value}
                  onChange={() => setExamType(et.value)} style={{ accentColor: 'var(--accent)' }} />
                <div>
                  <p className="text-sm font-medium">{et.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{et.desc}</p>
                </div>
              </label>
            ))}
            {examType && (
              <button type="button" onClick={() => setExamType('')}
                className="text-xs" style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>
                Auswahl zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Exam date */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={15} style={{ color: 'var(--purple)' }} />
            </div>
            <p className="font-semibold text-sm">Prüfungsdatum</p>
          </div>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            style={{
              background: 'var(--input-bg, var(--card))',
              border: '1px solid var(--card-border)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--fg)',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {examDate && (
            <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>
              {Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)} Tage bis zur Prüfung
            </p>
          )}
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}>
          <Save size={15} />
          {saving ? 'Wird gespeichert…' : saved ? '✓ Gespeichert' : 'Einstellungen speichern'}
        </button>
      </form>
    </div>
  )
}
