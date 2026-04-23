'use client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/client'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const router = useRouter()

  function handleChange(l: 'de' | 'en') {
    setLang(l)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-1"
      style={{ background: 'var(--card-border)' }}>
      {(['de', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          className="px-3 py-1 rounded-md text-xs font-semibold uppercase transition-all"
          style={{
            background: lang === l ? 'var(--card)' : 'transparent',
            color: lang === l ? 'var(--foreground)' : 'var(--muted)',
            boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
