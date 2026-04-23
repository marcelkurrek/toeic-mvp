'use client'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme/client'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-lg p-1"
      style={{ background: 'var(--card-border)' }}>
      {(['dark', 'light'] as const).map(t => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className="px-2 py-1 rounded-md transition-all flex items-center justify-center"
          style={{
            background: theme === t ? 'var(--card)' : 'transparent',
            color: theme === t ? 'var(--foreground)' : 'var(--muted)',
            boxShadow: theme === t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
        </button>
      ))}
    </div>
  )
}
