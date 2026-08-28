import { describe, expect, it } from 'vitest'

import type { MemoryItem, ReviewPatch } from '../types'
import { applyReview, DEFAULT_EASE_FACTOR, getMemoryStatus, MIN_EASE_FACTOR, sortByReviewPriority } from './schedule'

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000

// Local noon on fixed days keeps the start-of-tomorrow maths timezone-proof.
const noon = (monthIndex: number, day: number) => new Date(2026, monthIndex, day, 12).getTime()

const freshState = {
  easeFactor: DEFAULT_EASE_FACTOR,
  intervalDays: 0,
  repetitions: 0,
  nextReviewAt: null,
  lastReviewedAt: null
}

describe('applyReview', () => {
  const now = noon(7, 25)

  it('schedules a first successful review for tomorrow at the default ease', () => {
    expect(applyReview(freshState, 'good', now)).toEqual({
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 1,
      nextReviewAt: now + DAY_MS,
      lastReviewedAt: now
    })
  })

  it('walks the classic ladder 1 -> 6 days across two successes', () => {
    const once = applyReview(freshState, 'good', now)
    const twice = applyReview(once, 'good', now)

    expect(twice.intervalDays).toBe(6)
    expect(twice.repetitions).toBe(2)
    expect(twice.nextReviewAt).toBe(now + 6 * DAY_MS)
  })

  it('multiplies the previous interval by the ease factor afterwards', () => {
    let state = applyReview(freshState, 'good', now)
    state = applyReview(state, 'good', now)
    state = applyReview(state, 'good', now) // 6 × 2.5 = 15

    expect(state.intervalDays).toBe(15)
    expect(state.repetitions).toBe(3)
  })

  it('moves the ease factor up on easy and down on hard', () => {
    expect(applyReview(freshState, 'easy', now).easeFactor).toBeCloseTo(2.6)
    expect(applyReview(freshState, 'hard', now).easeFactor).toBeCloseTo(2.36)
  })

  it('resets to one day when forgotten but keeps the lowered ease factor', () => {
    const result = applyReview({ ...freshState, repetitions: 3, intervalDays: 15 }, 'again', now)

    expect(result.easeFactor).toBeCloseTo(2.18)
    expect(result.repetitions).toBe(0)
    expect(result.intervalDays).toBe(1)
    expect(result.nextReviewAt).toBe(now + DAY_MS)
  })

  it('never lets the ease factor sink below its floor', () => {
    let state: ReviewPatch = { ...freshState, easeFactor: 1.35 }
    for (let index = 0; index < 10; index += 1) {
      state = applyReview(state, 'again', now)
    }

    expect(state.easeFactor).toBe(MIN_EASE_FACTOR)
  })

  it('grows intervals fast on an easy/good run', () => {
    let state = applyReview(freshState, 'easy', now) // EF 2.6, 1 day
    state = applyReview(state, 'good', now) // 6 days
    state = applyReview(state, 'good', now) // round(6 × 2.6) = 16

    expect(state.easeFactor).toBeCloseTo(2.6)
    expect(state.intervalDays).toBe(16)
  })
})

describe('getMemoryStatus', () => {
  const now = noon(7, 25)

  it('treats items without any review as new', () => {
    expect(getMemoryStatus({ lastReviewedAt: null, nextReviewAt: null }, now)).toBe('new')
  })

  it('marks items whose review date has passed as due', () => {
    const item = { lastReviewedAt: now - 3 * DAY_MS, nextReviewAt: now - DAY_MS }
    expect(getMemoryStatus(item, now)).toBe('due')
  })

  it('keeps an item due until the very end of its due day', () => {
    const lateTonight = new Date(2026, 7, 25, 23, 59).getTime()
    const item = { lastReviewedAt: now - DAY_MS, nextReviewAt: now }
    expect(getMemoryStatus(item, lateTonight)).toBe('due')
  })

  it('stays scheduled until the scheduled day arrives, then turns due', () => {
    const item = { lastReviewedAt: now, nextReviewAt: now + 6 * DAY_MS }
    expect(getMemoryStatus(item, now + 5 * DAY_MS)).toBe('scheduled')
    expect(getMemoryStatus(item, now + 6 * DAY_MS + HOUR_MS)).toBe('due')
  })

  it('reports future reviews as scheduled', () => {
    const item = { lastReviewedAt: now, nextReviewAt: now + 15 * DAY_MS }
    expect(getMemoryStatus(item, now)).toBe('scheduled')
  })
})

describe('sortByReviewPriority', () => {
  it('puts never-reviewed items first, then oldest review dates', () => {
    const never: MemoryItem = { ...freshState } as unknown as MemoryItem
    const overdue = { nextReviewAt: noon(7, 20) } as MemoryItem
    const lessOverdue = { nextReviewAt: noon(7, 23) } as MemoryItem

    const sorted = [lessOverdue, never, overdue].sort(sortByReviewPriority)

    expect(sorted[0]).toBe(never)
    expect(sorted[1]).toBe(overdue)
    expect(sorted[2]).toBe(lessOverdue)
  })
})
