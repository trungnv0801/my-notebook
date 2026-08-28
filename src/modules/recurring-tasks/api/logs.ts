import { createNote, deleteNote } from '@/core/firebase/crud'

import type { RecurringLog } from '../types'

export const LOGS_COLLECTION = 'maintenanceLogs'

export interface NewRecurringLogInput {
  taskId: string
  /** `yyyy-MM-dd` as produced by `<input type="date">`. */
  performedAt: string
  /** Optional meter reading at occurrence time (only for tasks that track one). */
  readingValue?: number
}

export function addLog(uid: string, input: NewRecurringLogInput): Promise<string> {
  return createNote<RecurringLog>(uid, LOGS_COLLECTION, {
    taskId: input.taskId,
    performedAt: Date.parse(input.performedAt),
    readingValue: input.readingValue ?? null
  })
}

export function removeLog(uid: string, logId: string): Promise<void> {
  return deleteNote(uid, LOGS_COLLECTION, logId)
}
