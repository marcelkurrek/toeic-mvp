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
  lrPartsAttempted: number    // how many of 7 L+R parts have been practiced
  readingPartsAttempted: number  // how many of parts 5,6,7 practiced
  hasSpeaking: boolean
  hasWriting: boolean
  totalAnswered: number
}

export function computeAchievements(input: AchievementInput): Achievement[] {
  const {
    totalSessions, currentStreak, longestStreak,
    avgAccuracy, bestPartAccuracy, diagnosticDone,
    lrPartsAttempted, readingPartsAttempted, hasSpeaking, hasWriting, totalAnswered,
  } = input

  // Defensive defaults for potentially missing values
  const safeAvg  = avgAccuracy  ?? 0
  const safeBest = bestPartAccuracy ?? 0

  return [
    // ── Streak ────────────────────────────────────────────────────────────
    {
      id: 'streak-3', title: '3-Tage-Streak', icon: '🔥',
      desc: '3 Tage in Folge geübt — Gewohnheit gebildet', category: 'streak',
      unlocked: longestStreak >= 3,
      progress: Math.min(1, longestStreak / 3),
      progressLabel: `${Math.min(longestStreak, 3)}/3 Tage`,
    },
    {
      id: 'streak-7', title: 'Woche am Stück', icon: '🔥🔥',
      desc: '7 Tage in Folge geübt — echte Disziplin!', category: 'streak',
      unlocked: longestStreak >= 7,
      progress: Math.min(1, longestStreak / 7),
      progressLabel: `${Math.min(longestStreak, 7)}/7 Tage`,
    },
    {
      id: 'streak-30', title: '30-Tage-Champion', icon: '⚡',
      desc: '30 Tage in Folge — Prüfungsvorbereitung auf höchstem Niveau', category: 'streak',
      unlocked: longestStreak >= 30,
      progress: Math.min(1, longestStreak / 30),
      progressLabel: `${Math.min(longestStreak, 30)}/30 Tage`,
    },

    // ── Sessions ──────────────────────────────────────────────────────────
    {
      id: 'sessions-1', title: 'Erster Schritt', icon: '🎯',
      desc: 'Erste TOEIC-Übungssitzung abgeschlossen', category: 'sessions',
      unlocked: totalSessions >= 1,
      progress: Math.min(1, totalSessions),
      progressLabel: `${Math.min(totalSessions, 1)}/1 Sitzungen`,
    },
    {
      id: 'sessions-10', title: 'Lernender', icon: '📚',
      desc: '10 Sitzungen — du bist auf dem richtigen Weg', category: 'sessions',
      unlocked: totalSessions >= 10,
      progress: Math.min(1, totalSessions / 10),
      progressLabel: `${Math.min(totalSessions, 10)}/10 Sitzungen`,
    },
    {
      id: 'sessions-50', title: 'TOEIC-Veteran', icon: '🏋️',
      desc: '50 Sitzungen — intensive Vorbereitung', category: 'sessions',
      unlocked: totalSessions >= 50,
      progress: Math.min(1, totalSessions / 50),
      progressLabel: `${Math.min(totalSessions, 50)}/50 Sitzungen`,
    },
    {
      id: 'questions-100', title: '100 Fragen', icon: '💯',
      desc: '100 TOEIC-Fragen beantwortet', category: 'sessions',
      unlocked: totalAnswered >= 100,
      progress: Math.min(1, totalAnswered / 100),
      progressLabel: `${Math.min(totalAnswered, 100)}/100 Fragen`,
    },
    {
      id: 'questions-500', title: 'Fragenmeister', icon: '🧠',
      desc: '500 Fragen — auf echtem Prüfungsniveau trainiert', category: 'sessions',
      unlocked: totalAnswered >= 500,
      progress: Math.min(1, totalAnswered / 500),
      progressLabel: `${Math.min(totalAnswered, 500)}/500 Fragen`,
    },

    // ── Accuracy ──────────────────────────────────────────────────────────
    {
      id: 'accuracy-60', title: 'Auf Kurs', icon: '📈',
      desc: 'Ø Genauigkeit ≥ 60% — Fundament gelegt', category: 'accuracy',
      unlocked: safeAvg >= 0.60,
      progress: Math.min(1, safeAvg / 0.60),
      progressLabel: `${Math.round(safeAvg * 100)}% / 60%`,
    },
    {
      id: 'accuracy-75', title: 'TOEIC-600+', icon: '📊',
      desc: 'Ø Genauigkeit ≥ 75% — Score 600+ Level', category: 'accuracy',
      unlocked: safeAvg >= 0.75,
      progress: Math.min(1, safeAvg / 0.75),
      progressLabel: `${Math.round(safeAvg * 100)}% / 75%`,
    },
    {
      id: 'accuracy-80', title: 'TOEIC-730+', icon: '🏅',
      desc: 'Ø Genauigkeit ≥ 80% — Business-Niveau erreicht', category: 'accuracy',
      unlocked: safeAvg >= 0.80,
      progress: Math.min(1, safeAvg / 0.80),
      progressLabel: `${Math.round(safeAvg * 100)}% / 80%`,
    },
    {
      id: 'accuracy-90', title: 'TOEIC-860+', icon: '🏆',
      desc: 'Ø Genauigkeit ≥ 90% — Expertenniveau', category: 'accuracy',
      unlocked: safeAvg >= 0.90,
      progress: Math.min(1, safeAvg / 0.90),
      progressLabel: `${Math.round(safeAvg * 100)}% / 90%`,
    },
    {
      id: 'best-part-100', title: 'Perfekter Part', icon: '⭐',
      desc: 'In einem Part 100% Genauigkeit erreicht', category: 'accuracy',
      unlocked: safeBest >= 1.0,
      progress: safeBest,
      progressLabel: `${Math.round(safeBest * 100)}% / 100%`,
    },

    // ── Explorer ──────────────────────────────────────────────────────────
    {
      id: 'diagnostic', title: 'Einstufung gemacht', icon: '🔬',
      desc: 'Einstufungstest abgeschlossen — dein Level ist bekannt', category: 'explorer',
      unlocked: diagnosticDone,
      progress: diagnosticDone ? 1 : 0,
      progressLabel: diagnosticDone ? '✓ Abgeschlossen' : 'Noch ausstehend',
    },
    {
      id: 'all-reading', title: 'Reading komplett', icon: '📖',
      desc: 'Parts 5, 6 und 7 (Reading) alle geübt', category: 'explorer',
      unlocked: readingPartsAttempted >= 3,
      progress: Math.min(1, readingPartsAttempted / 3),
      progressLabel: `${readingPartsAttempted}/3 Reading-Parts`,
    },
    {
      id: 'all-lr-parts', title: 'L+R Vollständig', icon: '🗺️',
      desc: 'Alle 7 Listening & Reading Parts geübt', category: 'explorer',
      unlocked: lrPartsAttempted >= 7,
      progress: Math.min(1, lrPartsAttempted / 7),
      progressLabel: `${lrPartsAttempted}/7 Parts`,
    },
    {
      id: 'first-speaking', title: 'Erste Stimme', icon: '🎤',
      desc: 'Erste Speaking-Aufgabe abgeschlossen', category: 'explorer',
      unlocked: hasSpeaking,
      progress: hasSpeaking ? 1 : 0,
      progressLabel: hasSpeaking ? '✓ Abgeschlossen' : 'Speaking noch nicht geübt',
    },
    {
      id: 'first-writing', title: 'Erste Zeile', icon: '✍️',
      desc: 'Erste Writing-Aufgabe abgeschlossen', category: 'explorer',
      unlocked: hasWriting,
      progress: hasWriting ? 1 : 0,
      progressLabel: hasWriting ? '✓ Abgeschlossen' : 'Writing noch nicht geübt',
    },
  ]
}
