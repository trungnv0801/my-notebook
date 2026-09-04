import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { useModuleNotes } from '@/core/hooks/use-module-notes'
import type { Note } from '@/types/base-note'

import { addMemory, MEMORIES_COLLECTION, removeMemory, saveReview, updateMemory } from '../api/memories'
import type { ReviewGrade } from '../lib/schedule'
import type { MemoryItem, NewMemoryInput } from '../types'

export function useMemoies() {
  return useModuleNotes<MemoryItem>(MEMORIES_COLLECTION)
}

export function useCreateMemory() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: NewMemoryInput) => {
      if (!user) throw new Error('Not authenticated')
      return addMemory(user.uid, input)
    }
  })
}

export interface UpdateMemoryInput {
  memoryId: string
  patch: Partial<MemoryItem>
}

/** Generic field patch — used by the practice-done checkbox and anything else that tweaks one field. */
export function useUpdateMemory() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ memoryId, patch }: UpdateMemoryInput) => {
      if (!user) throw new Error('Not authenticated')
      return updateMemory(user.uid, memoryId, patch)
    }
  })
}

export interface ReviewMemoryInput {
  memoryId: string
  item: Note<MemoryItem>
  grade: ReviewGrade
}

/** Grades one spaced-repetition review and reschedules the item. */
export function useReviewMemory() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ memoryId, item, grade }: ReviewMemoryInput) => {
      if (!user) throw new Error('Not authenticated')
      return saveReview(user.uid, memoryId, item, grade)
    }
  })
}

export function useDeleteMemory() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (memoryId: string) => {
      if (!user) throw new Error('Not authenticated')
      return removeMemory(user.uid, memoryId)
    }
  })
}
