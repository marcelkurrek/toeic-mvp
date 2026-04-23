'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type ExamType = 'LISTENING_READING' | 'SPEAKING_WRITING' | 'FULL_CERTIFICATE'

export default function OnboardingPage() {
  const [examType, setExamType] = useState<ExamType | null>(null)
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()
  const { t }    = useLang()
  const l        = t.auth.onboarding

  const EXAMS: { value: ExamType; icon: string; key: 'lr' | 'sw' | 'fc' }[] = [
    { value: 'LISTENING_READING', icon: '📖', key: 'lr' },
    { value: 'SPEAKING_WRITING',  icon: '🗣️', key: 'sw' },
    { value: 'FULL_CERTIFICATE',  icon: '🎓', key: 'fc' },
  ]

  async function handleSave() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examType, examDate: examDate || null }),
    })

    router.push('/diagnostic')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'var(--background)' }}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="card" style={{ padding: '40px 36px' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              className="flex items-center justify-center text-white font-bold text-2xl mx-auto rounded-2xl"
              style={{ width: 64, height: 64, background: 'var(--accent)', marginBottom: 20, color: '#0d1b2a' }}
            >T</div>
            <h1 className="text-2xl font-bold" style={{ marginBottom: 8 }}>{l.heading}</h1>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{l.subheading}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div>
              <p className="text-sm font-semibold" style={{ marginBottom: 12, color: 'var(--foreground)' }}>
                {l.examTypeLabel}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {EXAMS.map(({ value, icon, key }) => {
                  const selected = examType === value
                  return (
                    <button
                      key={value}
                      onClick={() => setExamType(value)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: `2px solid ${selected ? 'var(--accent)' : 'var(--card-border)'}`,
                        background: selected ? 'var(--accent-subtle)' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background 0.15s',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 2 }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${selected ? 'var(--accent)' : 'var(--card-border)'}`,
                          background: selected ? 'var(--accent)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}>
                          {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d1b2a' }} />}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="font-semibold text-sm"
                            style={{ color: selected ? 'var(--accent)' : 'var(--foreground)' }}>
                            {l.exams[key].title}
                          </span>
                          <span className="text-xs font-medium" style={{
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: selected ? 'var(--accent)' : 'var(--card-border)',
                            color: selected ? '#0d1b2a' : 'var(--muted)',
                            whiteSpace: 'nowrap',
                          }}>
                            {l.exams[key].badge}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                          {l.exams[key].desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 10, color: 'var(--foreground)' }}>
                {l.examDateLabel}
              </label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="input-field"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div style={{ marginTop: 4 }}>
              <button
                onClick={handleSave}
                disabled={loading || !examType}
                className="btn-primary w-full"
                style={{ height: 48, fontSize: 15, fontWeight: 600 }}
              >
                {loading ? l.submitLoading : l.submitBtn}
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-sm text-center"
                style={{ marginTop: 16, padding: '8px 0', color: 'var(--muted)', cursor: 'pointer' }}
              >
                {l.skip}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
