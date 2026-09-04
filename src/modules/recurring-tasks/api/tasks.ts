import { createNote, deleteNote, updateNote } from '@/core/firebase/crud'

import type { RecurringTask } from '../types'

export const TASKS_COLLECTION = 'maintenanceTasks'

export interface NewRecurringTaskInput {
  name: string
  notes: string | null
  intervalDays: number | null
  intervalMonths: number | null
  trackReading: boolean
  readingLabel: string | null
  intervalReading: number | null
}

export function addTask(uid: string, input: NewRecurringTaskInput): Promise<string> {
  return createNote<NewRecurringTaskInput>(uid, TASKS_COLLECTION, input)
}

export function updateTask(uid: string, taskId: string, patch: Partial<RecurringTask>): Promise<void> {
  return updateNote(uid, TASKS_COLLECTION, taskId, { ...patch })
}

export function removeTask(uid: string, taskId: string): Promise<void> {
  return deleteNote(uid, TASKS_COLLECTION, taskId)
}
