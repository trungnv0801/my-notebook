import { describe, expect, it } from 'vitest'

import type { Note } from '@/types/base-note'

import type { RecurringLog, RecurringTask } from '../types'
import { computeTaskSchedule } from './schedule'

const DAY_MS = 86_400_000

const utc = (iso: string) => Date.parse(iso)

let logSequence = 0

function makeLog(performedAt: number, readingValue: number | null): Note<RecurringLog> {
  logSequence += 1
  return { id: `log-${logSequence}`, taskId: 'task-1', performedAt, readingValue, createdAt: null }
}

function makeTask(overrides: Partial<RecurringTask>): RecurringTask {
  return {
    name: 'Task',
    notes: null,
    intervalDays: null,
    intervalMonths: null,
    trackReading: false,
    readingLabel: null,
    intervalReading: null,
    ...overrides
  }
}

const monthTask = makeTask({ name: 'Oil change', intervalMonths: 6 })
const kmTask = makeTask({
  name: 'Oil change',
  trackReading: true,
  readingLabel: 'km',
  intervalReading: 2000
})

describe('computeTaskSchedule', () => {
  it('returns insufficient-data when nothing has been logged yet', () => {
    const schedule = computeTaskSchedule(monthTask, [], utc('2026-05-01'))

    expect(schedule.status).toBe('insufficient-data')
    expect(schedule.nextDueAt).toBeNull()
    expect(schedule.latestLogAt).toBeNull()
  })

  it('adds the month interval to the latest log date', () => {
    const schedule = computeTaskSchedule(monthTask, [makeLog(utc('2026-01-10'), null)], utc('2026-03-01'))

    expect(schedule.nextDueAt).toBe(utc('2026-07-10'))
    expect(schedule.status).toBe('ok')
    expect(schedule.latestLogAt).toBe(utc('2026-01-10'))
    expect(schedule.latestReading).toBeNull()
  })

  it('supports pure date-only tasks such as a dental scaling every 6 months', () => {
    const dental = makeTask({ name: 'Lấy cao răng', intervalMonths: 6 })
    // Dec 1 + 6 months lands 5 days ahead of May 27 -> inside the warning window.
    const schedule = computeTaskSchedule(dental, [makeLog(utc('2025-12-01'), null)], utc('2026-05-27'))

    expect(schedule.nextDueAt).toBe(utc('2026-06-01'))
    expect(schedule.status).toBe('due-soon')
    expect(schedule.nextDueReading).toBeNull()
    expect(schedule.remainingReading).toBeNull()
  })

  it('adds the day interval to the latest log date', () => {
    const plants = makeTask({ name: 'Water the plants', intervalDays: 3 })
    const schedule = computeTaskSchedule(plants, [makeLog(utc('2026-05-20'), null)], utc('2026-05-21'))

    expect(schedule.nextDueAt).toBe(utc('2026-05-23'))
  })

  it('picks the earlier of the day and month deadlines when both are set', () => {
    const hybrid = makeTask({ intervalDays: 10, intervalMonths: 2 })
    const schedule = computeTaskSchedule(hybrid, [makeLog(utc('2026-05-20'), null)], utc('2026-05-21'))

    // Day deadline: May 30. Month deadline: Jul 20. The day one wins.
    expect(schedule.nextDueAt).toBe(utc('2026-05-30'))
  })

  it('clamps to the last day of short months (Jan 31 + 1 month)', () => {
    const monthly = makeTask({ intervalMonths: 1 })
    const schedule = computeTaskSchedule(monthly, [makeLog(utc('2026-01-31'), null)], utc('2026-02-01'))

    expect(schedule.nextDueAt).toBe(utc('2026-02-28'))
  })

  it('marks the task overdue once the due date has passed', () => {
    const schedule = computeTaskSchedule(monthTask, [makeLog(utc('2025-07-01'), null)], utc('2026-03-01'))

    expect(schedule.status).toBe('overdue')
  })

  it('flags due-soon inside the warning window', () => {
    const monthly = makeTask({ intervalMonths: 1 })
    // May 20 + 1 month = Jun 20, which is 5 days ahead of Jun 15.
    const schedule = computeTaskSchedule(monthly, [makeLog(utc('2026-05-20'), null)], utc('2026-06-15'))

    expect(schedule.nextDueAt).toBe(utc('2026-06-20'))
    expect(schedule.status).toBe('due-soon')
  })

  it('estimates the reading-based due date from the average units/day of the history', () => {
    // 1 000 units over 10 days -> 100/day; 2 days after the latest log the
    // meter is ~11 200, leaving 1 800 of the 2 000-unit interval -> 18 days away.
    const logs = [makeLog(utc('2026-01-01'), 10_000), makeLog(utc('2026-01-11'), 11_000)]
    const now = utc('2026-01-13')

    const schedule = computeTaskSchedule(kmTask, logs, now)

    expect(schedule.avgPerDay).toBeCloseTo(100)
    expect(schedule.nextDueReading).toBe(13_000)
    expect(schedule.remainingReading).toBeCloseTo(1800)
    expect(schedule.nextDueAt).toBe(now + 18 * DAY_MS)
    expect(schedule.status).toBe('ok')
  })

  it('cannot estimate a date from a metered task with a single log', () => {
    const schedule = computeTaskSchedule(kmTask, [makeLog(utc('2026-01-01'), 10_000)], utc('2026-01-13'))

    expect(schedule.status).toBe('insufficient-data')
    expect(schedule.nextDueReading).toBe(12_000)
    expect(schedule.nextDueAt).toBeNull()
  })

  it('goes overdue immediately when the reading threshold is already behind', () => {
    const logs = [makeLog(utc('2026-01-01'), 10_000), makeLog(utc('2026-01-11'), 11_000)]
    const now = utc('2026-02-28') // ~48 days later at 100 units/day >> the 2 000-unit interval

    const schedule = computeTaskSchedule(kmTask, logs, now)

    expect(schedule.status).toBe('overdue')
    expect(schedule.nextDueAt).toBe(now)
    expect(schedule.remainingReading).toBe(0)
  })

  it('picks the earlier deadline when month and reading intervals are both set', () => {
    const both = makeTask({ intervalMonths: 1, trackReading: true, readingLabel: 'km', intervalReading: 2000 })
    const logs = [makeLog(utc('2026-01-01'), 10_000), makeLog(utc('2026-01-11'), 11_000)]
    const now = utc('2026-01-13')
    // Reading deadline: Jan 31 (18 days). Month deadline: Feb 11. The reading one wins.
    const schedule = computeTaskSchedule(both, logs, now)

    expect(schedule.nextDueAt).toBe(now + 18 * DAY_MS)
  })

  it('stays robust against out-of-order logs with conflicting readings', () => {
    const logs = [makeLog(utc('2026-01-11'), 11_000), makeLog(utc('2026-01-01'), 12_500)]
    const schedule = computeTaskSchedule(kmTask, logs, utc('2026-01-13'))

    expect(schedule.latestLogAt).toBe(utc('2026-01-11'))
    expect(schedule.latestReading).toBe(12_500)
    expect(schedule.nextDueReading).toBe(14_500)
    // No trustworthy average (the meter went down between the entries) -> no estimated date.
    expect(schedule.nextDueAt).toBeNull()
    expect(schedule.status).toBe('insufficient-data')
  })

  it('ignores reading math entirely when the task does not track a meter', () => {
    const schedule = computeTaskSchedule(monthTask, [makeLog(utc('2026-01-01'), 999_999)], utc('2026-03-01'))

    expect(schedule.nextDueReading).toBeNull()
    expect(schedule.avgPerDay).toBeNull()
    expect(schedule.nextDueAt).toBe(utc('2026-07-01'))
  })
})
