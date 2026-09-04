/** A titled set of external practice exercises reviewed on a spaced-repetition schedule. */
export interface MemoryItem {
  /** Short label shown in lists. */
  title: string
  /** Links to the external practice exercises included in this item. */
  practiceUrls: string[]
  /** True once the user has completed all practice exercises. */
  practiceDone: boolean
  /** SM-2 ease factor (starts at 2.5, clamped to a floor of 1.3). */
  easeFactor: number
  /** Current inter-review interval in days. */
  intervalDays: number
  /** Consecutive successful reviews; reset whenever the item is forgotten. */
  repetitions: number
  /** Epoch ms of the next scheduled review. Null until the first review is graded. */
  nextReviewAt: number | null
  /** Epoch ms of the most recent review. Null for never-reviewed items. */
  lastReviewedAt: number | null
}

export interface NewMemoryInput {
  title: string
  practiceUrls: string[]
}

/** The scheduling subset of {@link MemoryItem} — exactly what one graded review rewrites. */
export interface ReviewPatch {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: number | null
  lastReviewedAt: number | null
}
