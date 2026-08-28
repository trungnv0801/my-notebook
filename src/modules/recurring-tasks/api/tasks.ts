import { createNote, deleteNote } from '@/core/firebase/crud'

export const TASKS_COLLECTION = 'maintenanceTasks'

export interface NewRecurringTaskInput {
  name: string
  emoji: string | null
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

export function removeTask(uid: string, taskId: string): Promise<void> {
  return deleteNote(uid, TASKS_COLLECTION, taskId)
}
