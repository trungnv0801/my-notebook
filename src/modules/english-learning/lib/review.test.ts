import { describe, expect, it } from 'vitest'

import type { Vocabulary } from '../types'
import { isDue, reviewVocabulary } from './review'

const word: Vocabulary = {
  word: 'remember',
  meaning: 'ghi nhớ',
  example: '',
  intervalDays: 0,
  nextReviewAt: null,
  lastReviewedAt: null
}

describe('English vocabulary reviews', () => {
  it('includes new words and words whose review time has arrived', () => {
    expect(isDue(word, 1000)).toBe(true)
    expect(isDue({ ...word, nextReviewAt: 1000 }, 1000)).toBe(true)
    expect(isDue({ ...word, nextReviewAt: 1001 }, 1000)).toBe(false)
  })

  it('starts at one day, doubles successful intervals and caps them at 180 days', () => {
    const first = reviewVocabulary(word, true, 1000)
    expect(first).toEqual({ intervalDays: 1, lastReviewedAt: 1000, nextReviewAt: 1000 + 86_400_000 })
    expect(reviewVocabulary({ ...word, ...first }, true, 2000).intervalDays).toBe(2)
    expect(reviewVocabulary({ ...word, intervalDays: 128 }, true, 2000).intervalDays).toBe(180)
  })

  it('retries forgotten words in ten minutes and restarts the interval', () => {
    const retry = reviewVocabulary({ ...word, intervalDays: 16 }, false, 1000)
    expect(retry).toEqual({ intervalDays: 0, lastReviewedAt: 1000, nextReviewAt: 601000 })
    expect(isDue({ ...word, ...retry }, 600999)).toBe(false)
    expect(isDue({ ...word, ...retry }, 601000)).toBe(true)
    expect(reviewVocabulary({ ...word, ...retry }, true).intervalDays).toBe(1)
  })
})
