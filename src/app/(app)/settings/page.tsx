'use client'
import { useState, useEffect } from 'react'
import { Save, User, Calendar, BookOpen, Trash2, AlertTriangle, Target } from 'lucide-react'

const EXAM_TYPES = [
  { value: 'LISTENING_READING', label: 'TOEIC Listening & Reading', desc: 'Parts 1–7, Multiple Choice' },
  { value: 'SPEAKING_WRITING',  label: 'TOEIC Speaking & Writing',  desc: 'Mündlich & schriftlich' },
  { value: 'FULL_CERTIFICATE',  label: 'TOEIC Full Certificate',     desc: 'Alle 4 Bereiche' },
]

const SCORE_PRESETS = [600, 700, 730, 800, 860, 900, 990]

export default function SettingsPage() {
  const [name, setName]               = useState('')
  const [examType, setExamType]       = useState('')
  const [examDate, setExamDate]       = useState('')
  const [scoreTarget, setScoreTarget] = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput]             = useState('')
  const [deleting, setDeleting]                   = useState(false)
  const [deleteError, setDeleteError]             = useState('')

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? '')
        setExamType(data.examType ?? '')
        setExamDate(data.examDate ? data.examDate.slice(0, 10) : '')
        setScoreTarget(data.scoreTarget ? String(data.scoreTarget) : '')
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
          scoreTarget: scoreTarget ? parseInt(scoreTarget) : null,
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

  async function handleDelete() {
    if (deleteInput !== 'LÖSCHEN') return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/users/me/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      window.location.href = '/login'
    } catch {
      setDeleteError('Löschen fehlgeschlagen. Bitte versuche es erneut.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 640, margin: '0 auto', color: 'var(--muted)', fontSize: 14 }}>
      Einstellungen werden geladen…
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
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

        {/* Score target */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={15} style={{ color: '#fbbf24' }} />
            </div>
            <p className="font-semibold text-sm">Ziel-Score</p>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)', marginBottom: 12 }}>
            Welchen TOEIC-Score möchtest du erreichen? (Max: 990 für L&R)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {SCORE_PRESETS.map(p => (
              <button
                key={p} type="button"
                onClick={() => setScoreTarget(String(p))}
                style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${scoreTarget === String(p) ? '#fbbf24' : 'var(--card-border)'}`,
                  background: scoreTarget === String(p) ? 'rgba(251,191,36,0.15)' : 'transparent',
                  color: scoreTarget === String(p) ? '#fbbf24' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={scoreTarget}
            onChange={e => setScoreTarget(e.target.value)}
            placeholder="Eigenen Score eingeben, z.B. 750"
            min={10} max={990}
            style={{
              background: 'var(--card)', border: '1px solid var(--card-border)',
              borderRadius: 8, padding: '10px 14px', fontSize: 14,
              color: 'var(--fg)', outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
          {scoreTarget && (
            <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>
              Ziel: <strong style={{ color: '#fbbf24' }}>{scoreTarget} Punkte</strong>
              {examDate && ` · ${Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000)} Tage Zeit`}
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

      {/* Danger zone */}
      <div style={{ marginTop: 48, borderTop: '1px solid var(--card-border)', paddingTop: 32 }}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--error)', marginBottom: 16 }}>Gefahrenzone</h2>
        <div className="card" style={{ padding: '20px 24px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p className="font-medium text-sm" style={{ marginBottom: 4 }}>Konto löschen</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Alle Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowDeleteConfirm(true); setDeleteInput(''); setDeleteError('') }}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--error)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '8px 14px', background: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={13} />
              Konto löschen
            </button>
          </div>

          {showDeleteConfirm && (
            <div style={{ marginTop: 20, padding: '16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                  Bitte tippe <strong>LÖSCHEN</strong> zur Bestätigung
                </p>
              </div>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="LÖSCHEN"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--card)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: 8, padding: '10px 14px',
                  fontSize: 14, color: 'var(--fg)', outline: 'none',
                  marginBottom: 12,
                }}
              />
              {deleteError && <p className="text-xs" style={{ color: 'var(--error)', marginBottom: 8 }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteInput !== 'LÖSCHEN' || deleting}
                  style={{
                    flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: deleteInput === 'LÖSCHEN' && !deleting ? 'pointer' : 'not-allowed',
                    background: deleteInput === 'LÖSCHEN' ? '#ef4444' : 'rgba(239,68,68,0.2)',
                    color: deleteInput === 'LÖSCHEN' ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {deleting ? 'Wird gelöscht…' : 'Konto endgültig löschen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid var(--card-border)', background: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
