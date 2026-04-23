'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/client'
import { translateAuthError } from '@/lib/i18n/authErrors'
import { CheckCircle } from 'lucide-react'

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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()
  const { t }    = useLang()
  const l        = t.auth.resetPassword
  const lr       = t.auth.register

  const strength    = getStrength(password)
  const hasMinChars = password.length >= MIN_CHARS

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(translateAuthError(error.message, t.errors)); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
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

      {done ? (
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{l.success}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <input
              type="password"
              placeholder={l.passwordPlaceholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              autoComplete="new-password"
            />

            {/* Dot progress */}
            <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
              <div className="flex gap-1.5">
                {Array.from({ length: MIN_CHARS }).map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-200" style={{
                    width: 9, height: 9,
                    background: i < Math.min(password.length, MIN_CHARS)
                      ? (hasMinChars ? 'var(--success)' : 'var(--accent)')
                      : 'var(--card-border)',
                    transform: i < password.length ? 'scale(1.2)' : 'scale(1)',
                  }} />
                ))}
              </div>
              {!hasMinChars && password.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {password.length}/{MIN_CHARS} {lr.passwordMinChars}
                </span>
              )}
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{lr.passwordStrength}</span>
                  <span className="text-xs font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
                    {[lr.strength.veryWeak, lr.strength.weak, lr.strength.medium, lr.strength.strong, lr.strength.veryStrong][strength]}
                  </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: STRENGTH_WIDTHS[strength], background: STRENGTH_COLORS[strength] }} />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}

          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !hasMinChars}
              className="btn-primary w-full"
              style={{ height: 48, fontSize: 15, fontWeight: 600, opacity: !hasMinChars ? 0.45 : 1 }}
            >
              {loading ? l.submitLoading : l.submitBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
