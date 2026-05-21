'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function AppLayoutClient({
  isAdmin,
  children,
}: {
  isAdmin: boolean
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 999, display: 'block',
          }}
        />
      )}

      <main
        className="flex-1 overflow-auto"
        style={{ padding: '40px', paddingTop: 'var(--main-pt, 40px)' }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="hamburger-btn"
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 998,
            background: 'var(--card)', border: '1px solid var(--card-border)',
            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
            display: 'none',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: 'var(--foreground)',
          }}
        >
          <Menu size={18} />
        </button>

        <style>{`
          @media (max-width: 767px) {
            .hamburger-btn { display: flex !important; }
            main { padding-top: 56px !important; }
          }
        `}</style>

        {children}
      </main>
    </div>
  )
}
