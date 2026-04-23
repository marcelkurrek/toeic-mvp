'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/client'
import { translateAuthError } from '@/lib/i18n/authErrors'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const router   = useRouter()
  const supabase = createClient()
  const { t }    = useLang()
  const l        = t.auth.login

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(translateAuthError(error.message, t.errors)); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card" style={{ padding: '40px 36px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'var(--accent)' }}
          >T</div>
          <span className="font-bold text-base">{t.brand.name}</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>{l.heading}</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{l.subheading}</p>
      </div>

      {/* ── Form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email"
          placeholder={l.emailPlaceholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          autoComplete="email"
        />
        <div>
          <input
            type="password"
            placeholder={l.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="input-field"
            autoComplete="current-password"
          />
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Link href="/forgot-password" className="text-xs font-medium"
              style={{ color: 'var(--muted)' }}>
              {l.forgotPassword}
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--error)', marginTop: -4 }}>{error}</p>
        )}

        <div style={{ marginTop: 8 }}>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full"
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}
          >
            {loading ? l.submitLoading : l.submitBtn}
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-sm" style={{ marginTop: 28, color: 'var(--muted)' }}>
        {l.noAccount}{' '}
        <Link href="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>
          {l.registerLink}
        </Link>
      </p>
    </div>
  )
}
