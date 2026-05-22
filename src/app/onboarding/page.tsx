'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingExamTypeSelector } from '@/components/OnboardingExamTypeSelector'
import { OnboardingUseCaseSelector } from '@/components/OnboardingUseCaseSelector'
import { ArrowRight, ArrowLeft } from 'lucide-react'

type Step = 'exam-type' | 'use-case' | 'exam-date'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('exam-type')
  const [examType, setExamType] = useState<string>('')
  const [useCase, setUseCase] = useState<string>('')
  const [examDate, setExamDate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleExamTypeSelect = (type: string) => {
    setExamType(type)
    setStep('use-case')
  }

  const handleUseCaseSelect = (uc: string) => {
    setUseCase(uc)
    setStep('exam-date')
  }

  const handleBack = () => {
    if (step === 'use-case') {
      setExamType('')
      setStep('exam-type')
    } else if (step === 'exam-date') {
      setUseCase('')
      setStep('use-case')
    }
  }

  const handleContinue = async () => {
    if (!examType || !useCase) return

    setLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          examGoal: useCase,
          examDate: examDate || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to save profile')

      router.push('/diagnostic')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: 720, margin: '0 auto', marginBottom: 40 }}>
        {step !== 'exam-type' && (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} /> Zurück
          </button>
        )}

        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {(['exam-type', 'use-case', 'exam-date'] as const).map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background:
                  s === step || (['exam-type', 'use-case', 'exam-date'].indexOf(step) >= i)
                    ? 'var(--accent)'
                    : 'var(--card-border)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {step === 'exam-type' && (
          <OnboardingExamTypeSelector selected={examType} onSelect={handleExamTypeSelect} />
        )}

        {step === 'use-case' && (
          <OnboardingUseCaseSelector selected={useCase} onSelect={handleUseCaseSelect} />
        )}

        {step === 'exam-date' && (
          <div>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                Wann ist deine TOEIC-Prüfung?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                (Optional) Ein Prüfungsdatum hilft dir, deinen Trainingsplan zu strukturieren.
              </p>
            </div>

            <div
              style={{
                maxWidth: 400,
                margin: '0 auto',
                marginBottom: 32,
              }}
            >
              <label style={{ display: 'block', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
                  Prüfungsdatum
                </span>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--card-border)',
                    background: 'var(--card)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
            </div>

            {examDate && (
              <div
                style={{
                  maxWidth: 400,
                  margin: '0 auto 32px',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(79,70,229,0.05)',
                  border: '1px solid rgba(79,70,229,0.2)',
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                ⏰{' '}
                {Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}{' '}
                Tage bis zu deiner Prüfung
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {step === 'exam-date' && (
        <div
          style={{
            maxWidth: 400,
            margin: '0 auto',
            display: 'flex',
            gap: 12,
            marginTop: 40,
          }}
        >
          <button
            onClick={handleContinue}
            disabled={loading || !examType || !useCase}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Wird gespeichert...' : 'Weiter zum Einstufungstest'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      )}
    </div>
  )
}
