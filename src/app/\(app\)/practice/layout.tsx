'use client'
import { useState } from 'react'
import { ErrorReminderBanner } from '@/components/ErrorReminderBanner'

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  const [reminderDismissed, setReminderDismissed] = useState(false)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      {!reminderDismissed && (
        <div style={{ paddingTop: 20 }}>
          <ErrorReminderBanner onDismiss={() => setReminderDismissed(true)} />
        </div>
      )}
      {children}
    </div>
  )
}
