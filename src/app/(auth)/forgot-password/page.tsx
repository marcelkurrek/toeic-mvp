'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/client'
import { translateAuthError } from '@/lib/i18n/authErrors'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { t }    = useLang()
  const l        = t.auth.forgotPassword

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })
    if (error) { setError(translateAuthError(error.message, t.errors)); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="card" style={{ padding: '40px 36px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'var(--accent)' }}>T</div>
          <span className="font-bold text-base">{t.brand.name}</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>{l.heading}</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{l.subheading}</p>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <p className="font-semibold" style={{ marginBottom: 8 }}>{l.successTitle}</p>
          <p className="text-sm" style={{ color: 'var(--muted)', marginBottom: 28 }}>{l.successDesc}</p>
          <Link href="/login" className="btn-primary" style={{ display: 'inline-flex' }}>
            {l.backToLogin}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder={l.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="input-field"
            autoComplete="email"
          />
          {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="btn-primary w-full"
              style={{ height: 48, fontSize: 15, fontWeight: 600, opacity: !email ? 0.45 : 1 }}
            >
              {loading ? l.submitLoading : l.submitBtn}
            </button>
          </div>
        </div>
      )}

      {!sent && (
        <p className="text-center text-sm" style={{ marginTop: 28, color: 'var(--muted)' }}>
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            {l.backToLogin}
          </Link>
        </p>
      )}
    </div>
  )
}
