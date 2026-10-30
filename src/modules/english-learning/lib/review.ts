import type { Vocabulary } from '../types'

export function isDue(item: Vocabulary, now = Date.now()): boolean {
  return item.nextReviewAt === null || item.nextReviewAt <= now
}

export function reviewVocabulary(item: Vocabulary, remembered: boolean, now = Date.now()) {
  const intervalDays = remembered ? Math.min(Math.max(1, item.intervalDays * 2), 180) : 0
  return {
    intervalDays,
    lastReviewedAt: now,
    nextReviewAt: now + (remembered ? intervalDays * 86_400_000 : 10 * 60_000)
  }
}
