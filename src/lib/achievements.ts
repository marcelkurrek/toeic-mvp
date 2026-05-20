export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  category: 'streak' | 'sessions' | 'accuracy' | 'explorer'
  unlocked: boolean
  progress: number   // 0–1
  progressLabel: string
}

export interface AchievementInput {
  totalSessions: number
  currentStreak: number
  longestStreak: number
  avgAccuracy: number | null   // 0–1
  bestPartAccuracy: number | null  // 0–1
  diagnosticDone: boolean
  partsAttempted: number   // how many of [5,6,7] have been practiced
  totalAnswered: number
}

export function computeAchievements(input: AchievementInput): Achievement[] {
  const {
    totalSessions, currentStreak, longestStreak,
    avgAccuracy, bestPartAccuracy, diagnosticDone,
    partsAttempted, totalAnswered,
  } = input

  return [
    // ── Streak ────────────────────────────────────────────────────────────
    {
      id: 'streak-3', title: '3-Tage-Streak', icon: '🔥',
      desc: '3 Tage in Folge geübt', category: 'streak',
      unlocked: longestStreak >= 3,
      progress: Math.min(1, longestStreak / 3),
      progressLabel: `${Math.min(longestStreak, 3)}/3 Tage`,
    },
    {
      id: 'streak-7', title: '7-Tage-Streak', icon: '🔥🔥',
      desc: '7 Tage in Folge geübt', category: 'streak',
      unlocked: longestStreak >= 7,
      progress: Math.min(1, longestStreak / 7),
      progressLabel: `${Math.min(longestStreak, 7)}/7 Tage`,
    },
    {
      id: 'streak-30', title: '30-Tage-Streak', icon: '⚡',
      desc: '30 Tage in Folge geübt', category: 'streak',
      unlocked: longestStreak >= 30,
      progress: Math.min(1, longestStreak / 30),
      progressLabel: `${Math.min(longestStreak, 30)}/30 Tage`,
    },

    // ── Sessions ──────────────────────────────────────────────────────────
    {
      id: 'sessions-1', title: 'Erster Schritt', icon: '🎯',
      desc: 'Erste Übungssitzung abgeschlossen', category: 'sessions',
      unlocked: totalSessions >= 1,
      progress: Math.min(1, totalSessions / 1),
      progressLabel: `${Math.min(totalSessions, 1)}/1 Sitzungen`,
    },
    {
      id: 'sessions-10', title: 'Lernender', icon: '📚',
      desc: '10 Sitzungen abgeschlossen', category: 'sessions',
      unlocked: totalSessions >= 10,
      progress: Math.min(1, totalSessions / 10),
      progressLabel: `${Math.min(totalSessions, 10)}/10 Sitzungen`,
    },
    {
      id: 'sessions-50', title: 'Fleißiger Übler', icon: '🏋️',
      desc: '50 Sitzungen abgeschlossen', category: 'sessions',
      unlocked: totalSessions >= 50,
      progress: Math.min(1, totalSessions / 50),
      progressLabel: `${Math.min(totalSessions, 50)}/50 Sitzungen`,
    },
    {
      id: 'questions-100', title: 'Hundert Fragen', icon: '💯',
      desc: '100 Fragen insgesamt beantwortet', category: 'sessions',
      unlocked: totalAnswered >= 100,
      progress: Math.min(1, totalAnswered / 100),
      progressLabel: `${Math.min(totalAnswered, 100)}/100 Fragen`,
    },
    {
      id: 'questions-500', title: 'Fragenmeister', icon: '🧠',
      desc: '500 Fragen insgesamt beantwortet', category: 'sessions',
      unlocked: totalAnswered >= 500,
      progress: Math.min(1, totalAnswered / 500),
      progressLabel: `${Math.min(totalAnswered, 500)}/500 Fragen`,
    },

    // ── Accuracy ──────────────────────────────────────────────────────────
    {
      id: 'accuracy-60', title: 'Auf Kurs', icon: '📈',
      desc: 'Ø Genauigkeit ≥ 60 % erreicht', category: 'accuracy',
      unlocked: (avgAccuracy ?? 0) >= 0.60,
      progress: Math.min(1, (avgAccuracy ?? 0) / 0.60),
      progressLabel: `${Math.round((avgAccuracy ?? 0) * 100)}% / 60%`,
    },
    {
      id: 'accuracy-80', title: 'Prüfungsreif', icon: '🏅',
      desc: 'Ø Genauigkeit ≥ 80 % erreicht', category: 'accuracy',
      unlocked: (avgAccuracy ?? 0) >= 0.80,
      progress: Math.min(1, (avgAccuracy ?? 0) / 0.80),
      progressLabel: `${Math.round((avgAccuracy ?? 0) * 100)}% / 80%`,
    },
    {
      id: 'accuracy-90', title: 'TOEIC-Experte', icon: '🏆',
      desc: 'Ø Genauigkeit ≥ 90 % erreicht', category: 'accuracy',
      unlocked: (avgAccuracy ?? 0) >= 0.90,
      progress: Math.min(1, (avgAccuracy ?? 0) / 0.90),
      progressLabel: `${Math.round((avgAccuracy ?? 0) * 100)}% / 90%`,
    },
    {
      id: 'best-part-100', title: 'Perfekter Part', icon: '⭐',
      desc: 'In einem Part 100 % Genauigkeit', category: 'accuracy',
      unlocked: (bestPartAccuracy ?? 0) >= 1.0,
      progress: bestPartAccuracy ?? 0,
      progressLabel: `${Math.round((bestPartAccuracy ?? 0) * 100)}% / 100%`,
    },

    // ── Explorer ──────────────────────────────────────────────────────────
    {
      id: 'diagnostic', title: 'Einstufung gemacht', icon: '🔬',
      desc: 'Einstufungstest abgeschlossen', category: 'explorer',
      unlocked: diagnosticDone,
      progress: diagnosticDone ? 1 : 0,
      progressLabel: diagnosticDone ? '✓ Abgeschlossen' : 'Noch ausstehend',
    },
    {
      id: 'all-parts', title: 'Alle Parts', icon: '🗺️',
      desc: 'Parts 5, 6 und 7 alle geübt', category: 'explorer',
      unlocked: partsAttempted >= 3,
      progress: partsAttempted / 3,
      progressLabel: `${partsAttempted}/3 Parts`,
    },
  ]
}
