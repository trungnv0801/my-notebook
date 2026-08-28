import type { Note } from '@/types/base-note'

import type { RecurringLog, RecurringTask } from '../types'

const DAY_MS = 86_400_000

/** A task within this many days of its next due date counts as "due soon". */
export const DUE_SOON_DAYS = 7

export type TaskStatus = 'insufficient-data' | 'overdue' | 'due-soon' | 'ok'

export interface TaskSchedule {
  status: TaskStatus
  /** Next due date in epoch ms — earliest of every configured deadline. */
  nextDueAt: number | null
  /** Reading value at which the next occurrence is due (metered tasks only). */
  nextDueReading: number | null
  /** Estimated units left until the reading deadline (needs enough history). */
  remainingReading: number | null
  /** Average reading units/day derived from the history (needs >= 2 readings). */
  avgPerDay: number | null
  /** Latest logged occurrence date. */
  latestLogAt: number | null
  /** Highest reading ever logged (metered tasks only). */
  latestReading: number | null
}

function insufficientData(): TaskSchedule {
  return {
    status: 'insufficient-data',
    nextDueAt: null,
    nextDueReading: null,
    remainingReading: null,
    avgPerDay: null,
    latestLogAt: null,
    latestReading: null
  }
}

/** Adds months while clamping to the last day of short months (Jan 31 + 1 month -> Feb 28). */
function addMonths(timestamp: number, months: number): number {
  const date = new Date(timestamp)
  const dayOfMonth = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + months)
  const daysInTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(dayOfMonth, daysInTargetMonth))
  return date.getTime()
}

/**
 * Pure scheduling math that works for ANY recurring task, whatever mix of
 * intervals it configures:
 *
 * - Day interval: latest log date + intervalDays.
 * - Month interval: latest log date + intervalMonths.
 * - Reading interval (e.g. odometer km): highest reading + intervalReading,
 *   converted into an estimated date through the average units/day observed
 *   across the history (requires >= 2 logged readings).
 * - When several intervals are set, whichever deadline lands first wins.
 */
export function computeTaskSchedule(
  task: RecurringTask,
  logs: Note<RecurringLog>[],
  now: number = Date.now()
): TaskSchedule {
  const sorted = [...logs].sort((first, second) => first.performedAt - second.performedAt)
  const latest = sorted[sorted.length - 1]
  if (!latest) return insufficientData()

  const dueDateCandidates: number[] = []
  if (task.intervalDays != null) {
    dueDateCandidates.push(latest.performedAt + task.intervalDays * DAY_MS)
  }
  if (task.intervalMonths != null) {
    dueDateCandidates.push(addMonths(latest.performedAt, task.intervalMonths))
  }

  // Readings only ever grow: take the max so stray out-of-order entries stay harmless.
  const readingEntries = sorted.filter(
    (entry): entry is Note<RecurringLog> & { readingValue: number } => entry.readingValue != null
  )
  const oldestReading = readingEntries[0]
  const newestReading = readingEntries[readingEntries.length - 1]
  const maxReading = readingEntries.length > 0 ? Math.max(...readingEntries.map((entry) => entry.readingValue)) : null

  let nextDueReading: number | null = null
  let remainingReading: number | null = null
  let avgPerDay: number | null = null

  if (task.trackReading && task.intervalReading != null && maxReading != null) {
    nextDueReading = maxReading + task.intervalReading

    // Average units/day across the recorded readings (needs at least two and a real climb).
    if (
      newestReading &&
      oldestReading &&
      readingEntries.length >= 2 &&
      newestReading.readingValue > oldestReading.readingValue
    ) {
      const spanDays = (newestReading.performedAt - oldestReading.performedAt) / DAY_MS
      if (spanDays > 0) {
        avgPerDay = (newestReading.readingValue - oldestReading.readingValue) / spanDays

        // Project the meter forward to "now" to estimate what is still left.
        const daysSinceLastReading = Math.max(0, (now - newestReading.performedAt) / DAY_MS)
        remainingReading = nextDueReading - (maxReading + avgPerDay * daysSinceLastReading)
        dueDateCandidates.push(remainingReading <= 0 ? now : now + (remainingReading / avgPerDay) * DAY_MS)
      }
    }
  }

  const nextDueAt = dueDateCandidates.length > 0 ? Math.min(...dueDateCandidates) : null

  let status: TaskStatus
  if (nextDueAt == null) status = 'insufficient-data'
  else if (nextDueAt <= now) status = 'overdue'
  else if (nextDueAt - now <= DUE_SOON_DAYS * DAY_MS) status = 'due-soon'
  else status = 'ok'

  return {
    status,
    nextDueAt,
    nextDueReading,
    remainingReading: remainingReading != null ? Math.max(0, remainingReading) : null,
    avgPerDay,
    latestLogAt: latest.performedAt,
    latestReading: maxReading
  }
}
