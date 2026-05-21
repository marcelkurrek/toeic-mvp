import { Suspense } from 'react'
import DrillClient from './DrillClient'

export default function Part5DrillPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Lade Drill-Modus…</div>}>
      <DrillClient />
    </Suspense>
  )
}
