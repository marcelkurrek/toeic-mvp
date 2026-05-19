'use client'
import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <AlertCircle size={24} style={{ color: '#ef4444' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ marginBottom: 10 }}>Etwas ist schiefgelaufen</h2>
      <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
        Beim Laden der Seite ist ein Fehler aufgetreten. Bitte versuche es erneut.
      </p>
      <button
        onClick={reset}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
          background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
        }}
      >
        <RotateCcw size={14} />
        Nochmal versuchen
      </button>
    </div>
  )
}
