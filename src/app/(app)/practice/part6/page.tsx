'use client'
import PracticeShell from '@/components/PracticeShell'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Part6Inner() {
  const params = useSearchParams()
  const wrongIds = params.get('wrongIds')?.split(',').filter(Boolean)
  return <PracticeShell part={6} wrongIds={wrongIds} />
}

export default function Part6Page() {
  return <Suspense><Part6Inner /></Suspense>
}
