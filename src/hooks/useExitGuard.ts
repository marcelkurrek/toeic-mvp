'use client'
import { useEffect, useCallback, useState } from 'react'

export function useExitGuard(active: boolean) {
  const [showDialog, setShowDialog] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  // Block browser back/refresh/close
  useEffect(() => {
    if (!active) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [active])

  const navigate = useCallback((href: string, router: { push: (href: string) => void }) => {
    if (!active) { router.push(href); return }
    setPendingHref(href)
    setShowDialog(true)
  }, [active])

  const confirm = useCallback((router: { push: (href: string) => void }) => {
    setShowDialog(false)
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
  }, [pendingHref])

  const cancel = useCallback(() => {
    setShowDialog(false)
    setPendingHref(null)
  }, [])

  return { showDialog, navigate, confirm, cancel }
}
