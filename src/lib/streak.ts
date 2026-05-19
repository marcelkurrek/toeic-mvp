export function computeStreak(sessionDates: Date[]): { current: number; longest: number; lastActivity: Date | null } {
  if (sessionDates.length === 0) return { current: 0, longest: 0, lastActivity: null }

  const days = [...new Set(
    sessionDates.map(d => new Date(d).toISOString().slice(0, 10))
  )].sort().reverse()

  if (days.length === 0) return { current: 0, longest: 0, lastActivity: null }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let current = 0
  if (days[0] === today || days[0] === yesterday) {
    current = 1
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(new Date(days[i - 1]).getTime() - 86400000).toISOString().slice(0, 10)
      if (days[i] === prev) current++
      else break
    }
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(new Date(days[i - 1]).getTime() - 86400000).toISOString().slice(0, 10)
    if (days[i] === prev) { run++; if (run > longest) longest = run }
    else run = 1
  }

  return { current, longest, lastActivity: new Date(days[0]) }
}
