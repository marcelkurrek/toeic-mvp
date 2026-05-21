'use client'
import PracticeShell from '@/components/PracticeShell'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Part5Inner() {
  const params = useSearchParams()
  const wrongIds = params.get('wrongIds')?.split(',').filter(Boolean)
  return <PracticeShell part={5} wrongIds={wrongIds} />
}

export default function Part5Page() {
  return <Suspense><Part5Inner /></Suspense>
}
