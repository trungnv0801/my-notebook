import { createNote, deleteNote, updateNote } from '@/core/firebase/crud'

import type { ReviewGrade } from '../lib/schedule'
import { applyReview, DEFAULT_EASE_FACTOR } from '../lib/schedule'
import type { MemoryItem, NewMemoryInput } from '../types'

export const MEMORIES_COLLECTION = 'memoryItems'

export function addMemory(uid: string, input: NewMemoryInput): Promise<string> {
  return createNote(uid, MEMORIES_COLLECTION, {
    ...input,
    practiceDone: false,
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: null,
    lastReviewedAt: null
  })
}

export function removeMemory(uid: string, memoryId: string): Promise<void> {
  return deleteNote(uid, MEMORIES_COLLECTION, memoryId)
}

export function updateMemory(uid: string, memoryId: string, patch: Partial<MemoryItem>): Promise<void> {
  return updateNote(uid, MEMORIES_COLLECTION, memoryId, { ...patch })
}

/** Grades one review of the item and persists the rescheduled SM-2 fields. */
export function saveReview(
  uid: string,
  memoryId: string,
  item: MemoryItem,
  grade: ReviewGrade,
  now: number = Date.now()
): Promise<void> {
  return updateNote(uid, MEMORIES_COLLECTION, memoryId, { ...applyReview(item, grade, now) })
}
