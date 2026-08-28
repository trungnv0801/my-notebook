/** Anything the user wants to remember long-term: a concept, a tip, an excerpt… */
export interface MemoryItem {
  /** Short label shown in lists. May be empty — the UI falls back to the first content line. */
  title: string
  /** Free-form long-form content, deliberately unstructured. */
  content: string
  /** Link to an external quiz for this item. Empty string when the item has none. */
  quizUrl: string
  /** True once the user ticked the "quiz done" checkbox. */
  quizDone: boolean
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
  content: string
  quizUrl: string
}

/** The scheduling subset of {@link MemoryItem} — exactly what one graded review rewrites. */
export interface ReviewPatch {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: number | null
  lastReviewedAt: number | null
}
