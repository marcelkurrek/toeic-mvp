import { addDays } from 'date-fns'

export interface SrsState {
  repetitions: number
  interval: number
  easeFactor: number
  dueDate: Date
  lastReviewed: Date | null
}

/**
 * SM-2 algorithm: given current card state and answer quality (0–5),
 * returns updated state.
 *
 * quality:
 *   5 – perfect recall
 *   4 – correct with slight hesitation
 *   3 – correct with difficulty
 *   2 – wrong, remembered after seeing answer
 *   1 – wrong, hard to recall
 *   0 – complete blackout
 */
export function sm2(state: SrsState, quality: number): SrsState {
  let { repetitions, interval, easeFactor } = state

  if (quality >= 3) {
    interval =
      repetitions === 0 ? 1 :
      repetitions === 1 ? 6 :
      Math.round(interval * easeFactor)
    repetitions++
  } else {
    repetitions = 0
    interval = 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  )

  return {
    repetitions,
    interval,
    easeFactor,
    dueDate: addDays(new Date(), interval),
    lastReviewed: new Date(),
  }
}

/**
 * Maps a TOEIC answer to an SM-2 quality score.
 * Uses time relative to typical answer time (30s baseline).
 */
export function answerQuality(isCorrect: boolean, timeSpentSec: number | null): number {
  if (!isCorrect) return 1

  const t = timeSpentSec ?? 30
  if (t < 15) return 5
  if (t < 30) return 4
  return 3
}
