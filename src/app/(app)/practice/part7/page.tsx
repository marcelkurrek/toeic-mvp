'use client'
import PracticeShell from '@/components/PracticeShell'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Part7Inner() {
  const params = useSearchParams()
  const wrongIds = params.get('wrongIds')?.split(',').filter(Boolean)
  return <PracticeShell part={7} wrongIds={wrongIds} />
}

export default function Part7Page() {
  return <Suspense><Part7Inner /></Suspense>
}
