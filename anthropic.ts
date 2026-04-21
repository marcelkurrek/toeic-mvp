'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">TOEIC Prep</h1>
        <p style={{ color: 'var(--muted)' }}>Sign in to continue</p>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg outline-none"
          style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: 'var(--foreground)' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full px-4 py-3 rounded-lg outline-none"
          style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: 'var(--foreground)' }}
        />
        {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--accent)' }}>Register</Link>
      </p>
    </div>
  )
}
