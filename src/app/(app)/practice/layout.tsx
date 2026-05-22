'use client'
import { useState } from 'react'
import { ErrorReminderBanner } from '@/components/ErrorReminderBanner'

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  const [bannerDismissed, setBannerDismissed] = useState(false)

  return (
    <div>
      {!bannerDismissed && (
        <ErrorReminderBanner onDismiss={() => setBannerDismissed(true)} />
      )}
      {children}
    </div>
  )
}
