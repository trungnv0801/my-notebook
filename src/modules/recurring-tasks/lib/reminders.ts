import type { Note } from '@/types/base-note'

import type { RecurringLog, RecurringTask } from '../types'
import { computeTaskSchedule } from './schedule'

export type ReminderStatus = 'overdue' | 'due-soon'

export interface TaskReminder {
  taskId: string
  name: string
  status: ReminderStatus
  nextDueAt: number
}

function urgencyRank(reminder: TaskReminder): number {
  return reminder.status === 'overdue' ? 0 : 1
}

/**
 * Turns task schedules into a flat list of things the user should be notified
 * about right now: anything overdue or due within DUE_SOON_DAYS, most urgent
 * first. Works for every task shape — no per-task-type code needed.
 */
export function collectReminders(
  tasks: Note<RecurringTask>[],
  logsByTask: Map<string, Note<RecurringLog>[]>,
  now: number = Date.now()
): TaskReminder[] {
  const reminders: TaskReminder[] = []
  for (const task of tasks) {
    const schedule = computeTaskSchedule(task, logsByTask.get(task.id) ?? [], now)
    if ((schedule.status === 'overdue' || schedule.status === 'due-soon') && schedule.nextDueAt != null) {
      reminders.push({
        taskId: task.id,
        name: task.name,
        status: schedule.status,
        nextDueAt: schedule.nextDueAt
      })
    }
  }
  return reminders.sort(
    (first, second) => urgencyRank(first) - urgencyRank(second) || first.nextDueAt - second.nextDueAt
  )
}
