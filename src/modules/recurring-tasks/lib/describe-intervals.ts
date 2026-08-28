import type { RecurringTask } from '../types'

type Translate = (key: string, options?: Record<string, unknown>) => string

/**
 * Human one-liner describing when the task repeats, e.g.
 * "Every 6 months · Every 2000 km". Built from whatever intervals the task
 * actually configures, so any future combination renders without code changes.
 */
export function describeIntervals(task: RecurringTask, t: Translate): string {
  const parts: string[] = []
  if (task.intervalDays != null) parts.push(t('list.everyDays', { days: task.intervalDays }))
  if (task.intervalMonths != null) parts.push(t('list.everyMonths', { months: task.intervalMonths }))
  if (task.intervalReading != null) {
    parts.push(t('list.everyReading', { amount: task.intervalReading, unit: task.readingLabel ?? '' }))
  }
  return parts.join(' · ')
}
