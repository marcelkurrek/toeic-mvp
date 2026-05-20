import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { computeAchievements } from '@/lib/achievements'
import { computeStreak } from '@/lib/streak'

const CATEGORY_LABELS: Record<string, string> = {
  streak:   '🔥 Streak',
  sessions: '📚 Sitzungen',
  accuracy: '🎯 Genauigkeit',
  explorer: '🗺️ Entdecker',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      progress: true,
      sessions: { where: { completedAt: { not: null } }, orderBy: { createdAt: 'desc' } },
    },
  })

  const sessions     = dbUser?.sessions ?? []
  const progress     = dbUser?.progress ?? []
  const streak       = computeStreak(sessions.map(s => s.createdAt))
  const totalAnswered = sessions.reduce((sum, s) => sum + s.totalQuestions, 0)
  const avgAccuracy  = progress.length
    ? progress.reduce((s, p) => s + p.accuracy, 0) / progress.length
    : null
  const bestPartAcc  = progress.length
    ? Math.max(...progress.map(p => p.accuracy))
    : null
  const partsAttempted = new Set(progress.map(p => p.part)).size

  const achievements = computeAchievements({
    totalSessions: sessions.length,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    avgAccuracy,
    bestPartAccuracy: bestPartAcc,
    diagnosticDone: dbUser?.diagnosticDone ?? false,
    partsAttempted,
    totalAnswered,
  })

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount    = achievements.length

  // Group by category
  const categories = ['streak', 'sessions', 'accuracy', 'explorer'] as const
  const byCategory  = Object.fromEntries(
    categories.map(cat => [cat, achievements.filter(a => a.category === cat)])
  )

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Achievements</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{unlockedCount} von {totalCount} freigeschaltet</p>
      </div>

      {/* Overall progress */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p className="font-semibold text-sm">Gesamtfortschritt</p>
          <p className="font-bold" style={{ color: 'var(--accent)' }}>{Math.round(unlockedCount / totalCount * 100)}%</p>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${unlockedCount / totalCount * 100}%`, transition: 'width 0.5s' }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{unlockedCount} / {totalCount} Achievements</p>
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const items     = byCategory[cat]
        const catUnlocked = items.filter(a => a.unlocked).length
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <h2 className="text-base font-semibold">{CATEGORY_LABELS[cat]}</h2>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{catUnlocked}/{items.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {items.map(a => (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    padding: '16px 18px',
                    opacity: a.unlocked ? 1 : 0.5,
                    border: a.unlocked ? '1.5px solid var(--success)' : undefined,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {a.unlocked && (
                    <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'rgba(74,222,128,0.12)', padding: '2px 7px', borderRadius: 99 }}>
                      ✓ Freigeschaltet
                    </div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
                  <p className="font-semibold text-sm" style={{ marginBottom: 3 }}>{a.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>{a.desc}</p>
                  {!a.unlocked && (
                    <div>
                      <div style={{ height: 4, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${a.progress * 100}%` }} />
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--muted)' }}>{a.progressLabel}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
