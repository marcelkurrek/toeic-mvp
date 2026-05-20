export default function Loading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 32, width: 240, borderRadius: 8, background: 'var(--card-border)', marginBottom: 10 }} />
        <div style={{ height: 16, width: 180, borderRadius: 6, background: 'var(--card-border)' }} />
      </div>
      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ height: 12, width: 80, borderRadius: 6, background: 'var(--card-border)', marginBottom: 14 }} />
            <div style={{ height: 32, width: 60, borderRadius: 8, background: 'var(--card-border)', marginBottom: 8 }} />
            <div style={{ height: 10, width: 100, borderRadius: 5, background: 'var(--card-border)' }} />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} className="card" style={{ padding: '20px 24px', marginBottom: 14 }}>
          <div style={{ height: 14, width: 160, borderRadius: 6, background: 'var(--card-border)', marginBottom: 12 }} />
          <div style={{ height: 10, width: '100%', borderRadius: 5, background: 'var(--card-border)', marginBottom: 8 }} />
          <div style={{ height: 10, width: '70%', borderRadius: 5, background: 'var(--card-border)' }} />
        </div>
      ))}
    </div>
  )
}
