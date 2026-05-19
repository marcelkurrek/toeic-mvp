export default function AdminLoading() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 32, width: 200, borderRadius: 8, background: 'var(--card-border)', marginBottom: 10 }} />
        <div style={{ height: 14, width: 140, borderRadius: 6, background: 'var(--card-border)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ height: 12, width: 80, borderRadius: 6, background: 'var(--card-border)', marginBottom: 14 }} />
            <div style={{ height: 32, width: 60, borderRadius: 8, background: 'var(--card-border)' }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ height: 300, padding: 24 }}>
        <div style={{ height: 14, width: 120, borderRadius: 6, background: 'var(--card-border)', marginBottom: 20 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: 10, width: `${70 + i * 5}%`, borderRadius: 5, background: 'var(--card-border)', marginBottom: 12 }} />
        ))}
      </div>
    </div>
  )
}
