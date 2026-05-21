// Barron's TOEIC Premium 10th Edition, p.256 — actual conversion table
// Listening and Reading have different curves (Reading is weaker at low scores)

const L_TABLE: [number, number][] = [
  [0, 5], [5, 30], [10, 60], [15, 90], [20, 120], [25, 150], [30, 175],
  [35, 200], [40, 220], [45, 235], [50, 250], [55, 265], [60, 275],
  [65, 290], [70, 305], [75, 320], [80, 335], [85, 355], [90, 375],
  [95, 420], [100, 495],
]

const R_TABLE: [number, number][] = [
  [0, 5], [5, 10], [10, 20], [15, 35], [20, 50], [25, 60], [30, 75],
  [35, 90], [40, 105], [45, 120], [50, 140], [55, 160], [60, 180],
  [65, 200], [70, 225], [75, 250], [80, 280], [85, 315], [90, 350],
  [95, 420], [100, 495],
]

function interpolate(table: [number, number][], correct: number, maxQ: number): number {
  const pct = (correct / maxQ) * 100
  const clamped = Math.min(100, Math.max(0, pct))
  for (let i = 1; i < table.length; i++) {
    const [x0, y0] = table[i - 1]
    const [x1, y1] = table[i]
    if (clamped <= x1) {
      const t = (clamped - x0) / (x1 - x0)
      return Math.round(y0 + t * (y1 - y0))
    }
  }
  return table[table.length - 1][1]
}

export function estimateListeningScore(correct: number, total = 100): number {
  return interpolate(L_TABLE, correct, total)
}

export function estimateReadingScore(correct: number, total = 100): number {
  return interpolate(R_TABLE, correct, total)
}

/** Convert accuracy (0–1) to TOEIC section score (5–495) */
export function accuracyToListeningScore(accuracy: number): number {
  return estimateListeningScore(accuracy * 100, 100)
}

export function accuracyToReadingScore(accuracy: number): number {
  return estimateReadingScore(accuracy * 100, 100)
}

/** Score range label for display */
export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 860) return { label: 'C1+', color: '#04FF88' }
  if (score >= 730) return { label: 'B2+', color: '#4ade80' }
  if (score >= 605) return { label: 'B2', color: '#fbbf24' }
  if (score >= 490) return { label: 'B1+', color: '#fb923c' }
  if (score >= 385) return { label: 'B1', color: '#f97316' }
  return { label: 'A2', color: '#ef4444' }
}
