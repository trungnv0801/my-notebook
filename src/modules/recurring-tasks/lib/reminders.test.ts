import { describe, expect, it } from 'vitest'

import type { Note } from '@/types/base-note'

import type { RecurringLog, RecurringTask } from '../types'
import { collectReminders } from './reminders'

const utc = (iso: string) => Date.parse(iso)

let logSequence = 0

function makeTask(id: string, overrides: Partial<RecurringTask> = {}): Note<RecurringTask> {
  return {
    id,
    createdAt: null,
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

function makeLog(taskId: string, performedAt: number, readingValue: number | null): Note<RecurringLog> {
  logSequence += 1
  return { id: `log-${logSequence}`, taskId, performedAt, readingValue, createdAt: null }
}

describe('collectReminders', () => {
  it('flags overdue date-only tasks without any reading math', () => {
    const tasks = [makeTask('t1', { name: 'Lấy cao răng', intervalMonths: 6 })]
    const logs = new Map([['t1', [makeLog('t1', utc('2025-06-01'), null)]]])

    const reminders = collectReminders(tasks, logs, utc('2026-03-01'))

    expect(reminders).toHaveLength(1)
    expect(reminders[0]).toMatchObject({ taskId: 't1', name: 'Lấy cao răng', status: 'overdue' })
  })

  it('sorts overdue first, then due-soon by due date', () => {
    const overdue = makeTask('overdue-task', { name: 'Đánh giá mục tiêu nghề nghiệp', intervalMonths: 6 })
    const dueSoon = makeTask('due-soon-task', { name: 'Khám sức khỏe tổng quát', intervalMonths: 12 })
    const logs = new Map([
      ['overdue-task', [makeLog('overdue-task', utc('2025-06-01'), null)]],
      // Apr 10 + 12 months lands 2 days ahead of "now".
      ['due-soon-task', [makeLog('due-soon-task', utc('2025-04-10'), null)]]
    ])

    const reminders = collectReminders([dueSoon, overdue], logs, utc('2026-04-08'))

    expect(reminders.map((reminder) => reminder.taskId)).toEqual(['overdue-task', 'due-soon-task'])
    expect(reminders.map((reminder) => reminder.status)).toEqual(['overdue', 'due-soon'])
  })

  it('skips tasks that are on track or have no data', () => {
    const fresh = makeTask('fresh', { intervalMonths: 6 })
    const empty = makeTask('empty', { intervalMonths: 6 })
    const logs = new Map([['fresh', [makeLog('fresh', utc('2026-02-01'), null)]]])

    const reminders = collectReminders([fresh, empty], logs, utc('2026-03-01'))

    expect(reminders).toHaveLength(0)
  })

  it('flags a metered task once its projected usage blows past the interval', () => {
    const oil = makeTask('oil', {
      name: 'Thay dầu xe máy',
      trackReading: true,
      readingLabel: 'km',
      intervalReading: 1000
    })
    const logs = new Map([
      ['oil', [makeLog('oil', utc('2026-01-01'), 10_000), makeLog('oil', utc('2026-01-11'), 10_500)]]
    ])

    const reminders = collectReminders([oil], logs, utc('2026-03-15'))

    expect(reminders).toHaveLength(1)
    expect(reminders[0]?.status).toBe('overdue')
  })
})
