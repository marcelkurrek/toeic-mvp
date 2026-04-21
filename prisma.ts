'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="card p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Create Account</h1>
        <p style={{ color: 'var(--muted)' }}>Start your TOEIC preparation</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg outline-none"
          style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: 'var(--foreground)' }}
        />
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
          className="w-full px-4 py-3 rounded-lg outline-none"
          style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', color: 'var(--foreground)' }}
        />
        {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
      </p>
    </div>
  )
}
