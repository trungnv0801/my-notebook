import type { MemoryItem, ReviewPatch } from '../types'

const DAY_MS = 86_400_000

export const DEFAULT_EASE_FACTOR = 2.5
export const MIN_EASE_FACTOR = 1.3

/** Self-assessed recall quality, mapped onto the SM-2 review qualities 2–5. */
export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 2,
  hard: 3,
  good: 4,
  easy: 5
}

export type MemoryStatus = 'new' | 'due' | 'scheduled'

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000
}

/** Local midnight right after "now" — an item counts as due while nextReviewAt lies before it. */
function startOfTomorrow(now: number): number {
  const date = new Date(now)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime()
}

/**
 * Pure SM-2 step for one graded review of a memory item.
 *
 * - Every grade moves the ease factor: EF' = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02)).
 * - "Again" (q < 3) resets the ladder: repetitions drop to zero and the item comes back tomorrow,
 *   but the lowered ease factor is kept so future intervals grow more slowly.
 * - Successful reviews walk the classic ladder: 1 day, then 6 days, then interval × EF forever.
 */
export function applyReview(state: ReviewPatch, grade: ReviewGrade, now: number = Date.now()): ReviewPatch {
  const quality = GRADE_QUALITY[grade]
  const rawEaseFactor = state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const easeFactor = Math.max(MIN_EASE_FACTOR, round4(rawEaseFactor))

  if (quality < 3) {
    return {
      easeFactor,
      intervalDays: 1,
      repetitions: 0,
      nextReviewAt: now + DAY_MS,
      lastReviewedAt: now
    }
  }

  const repetitions = state.repetitions + 1
  const previousInterval = Math.max(state.intervalDays, 1)
  const intervalDays =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(previousInterval * easeFactor))

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now
  }
}

/** Lifecycle bucket of an item: never reviewed yet, due right now, or scheduled for later. */
export function getMemoryStatus(
  item: Pick<MemoryItem, 'lastReviewedAt' | 'nextReviewAt'>,
  now: number = Date.now()
): MemoryStatus {
  if (item.lastReviewedAt == null) return 'new'
  if (item.nextReviewAt != null && item.nextReviewAt < startOfTomorrow(now)) return 'due'
  return 'scheduled'
}

/** Most overdue first; never-reviewed items count as the most overdue of all. */
export function sortByReviewPriority(first: MemoryItem, second: MemoryItem): number {
  return (first.nextReviewAt ?? Number.NEGATIVE_INFINITY) - (second.nextReviewAt ?? Number.NEGATIVE_INFINITY)
}
