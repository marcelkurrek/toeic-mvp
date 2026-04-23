'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n/client'
import { translateAuthError } from '@/lib/i18n/authErrors'

const MIN_CHARS = 6

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (pw.length === 0) return 0
  let score = 0
  if (pw.length >= MIN_CHARS) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(4, Math.max(0, score - 1)) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
const STRENGTH_WIDTHS  = ['20%', '40%', '60%', '80%', '100%']

function Check({ ok }: { ok: boolean }) {
  return (
    <div
      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200"
      style={{ background: ok ? 'var(--success)' : 'var(--card-border)' }}
    >
      {ok && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router    = useRouter()
  const supabase  = createClient()
  const { t }     = useLang()
  const l         = t.auth.register

  const strength    = getStrength(password)
  const filledDots  = Math.min(password.length, MIN_CHARS)
  const hasMinChars = password.length >= MIN_CHARS
  const criteria    = [
    { ok: hasMinChars,                                       label: l.passwordMinChars },
    { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), label: 'A–Z & a–z' },
    { ok: /[0-9]/.test(password),                           label: '0–9' },
    { ok: /[^A-Za-z0-9]/.test(password),                   label: '!@#…' },
  ]

  async function handleRegister() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) { setError(translateAuthError(error.message, t.errors)); setLoading(false); return }
    router.push('/onboarding')
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
          <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{t.brand.name}</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>{l.heading}</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{l.subheading}</p>
      </div>

      {/* ── Form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <input
          type="text"
          placeholder={l.namePlaceholder}
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field"
        />

        <input
          type="email"
          placeholder={l.emailPlaceholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
        />

        {/* ── Password block ── */}
        <div>
          <input
            type="password"
            placeholder={l.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field"
          />

          {/* 6-dot progress */}
          <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
            <div className="flex gap-1.5">
              {Array.from({ length: MIN_CHARS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 9,
                    height: 9,
                    background: i < filledDots
                      ? (hasMinChars ? 'var(--success)' : 'var(--accent)')
                      : 'var(--card-border)',
                    transform: i < filledDots ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            {!hasMinChars && password.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {password.length}/{MIN_CHARS} {l.passwordMinChars}
              </span>
            )}
          </div>

          {/* Strength bar + criteria — only visible once typing starts */}
          {password.length > 0 && (
            <div style={{ marginTop: 16 }}>

              {/* Bar */}
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{l.passwordStrength}</span>
                <span className="text-xs font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
                  {[l.strength.veryWeak, l.strength.weak, l.strength.medium, l.strength.strong, l.strength.veryStrong][strength]}
                </span>
              </div>
              <div
                className="rounded-full overflow-hidden"
                style={{ height: 6, background: 'var(--card-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: STRENGTH_WIDTHS[strength], background: STRENGTH_COLORS[strength] }}
                />
              </div>

              {/* Criteria checklist */}
              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px 24px',
                }}
              >
                {criteria.map(({ ok, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Check ok={ok} />
                    <span
                      className="text-xs transition-colors duration-200"
                      style={{ color: ok ? 'var(--foreground)' : 'var(--muted)' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
        )}

        {/* ── Submit ── */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={handleRegister}
            disabled={loading || !hasMinChars}
            className="btn-primary w-full"
            style={{
              opacity: !hasMinChars ? 0.45 : 1,
              cursor: !hasMinChars ? 'not-allowed' : 'pointer',
              height: 48,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {loading ? l.submitLoading : l.submitBtn}
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-sm" style={{ marginTop: 28, color: 'var(--muted)' }}>
        {l.hasAccount}{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
          {l.loginLink}
        </Link>
      </p>
    </div>
  )
}
