import { useEffect } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Note } from '@/types/base-note'

import { useAuth } from '../auth/use-auth'
import { subscribeToNotes } from '../firebase/crud'

export function moduleNotesKey(uid: string | undefined, collectionName: string) {
  return ['notes', uid ?? 'anonymous', collectionName] as const
}

export function useModuleNotes<T extends object>(collectionName: string) {
  const { user } = useAuth()
  const uid = user?.uid
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!uid) return undefined
    return subscribeToNotes<T>(uid, collectionName, (notes) => {
      queryClient.setQueryData(moduleNotesKey(uid, collectionName), notes)
    })
  }, [uid, collectionName, queryClient])

  return useQuery<Note<T>[]>({
    queryKey: moduleNotesKey(uid, collectionName),
    enabled: false,
    staleTime: Infinity,
    initialData: []
  })
}
