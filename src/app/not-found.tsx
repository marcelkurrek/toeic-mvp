import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{ fontSize: 80, marginBottom: 8, lineHeight: 1 }}>404</p>
        <h2 className="text-xl font-bold" style={{ marginBottom: 10 }}>Seite nicht gefunden</h2>
        <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
          Diese Seite existiert nicht oder wurde entfernt.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex', fontSize: 14 }}>
          Zum Dashboard
        </Link>
      </div>
    </div>
  )
}
