import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { createNote, deleteNote, updateNote } from '@/core/firebase/crud'
import { useModuleNotes } from '@/core/hooks/use-module-notes'

import { reviewVocabulary } from '../lib/review'
import type { Vocabulary } from '../types'

export const VOCABULARY_COLLECTION = 'englishVocabulary'
type Content = Pick<Vocabulary, 'word' | 'meaning' | 'example' | 'phonetic'>
type Action =
  | { type: 'save'; id?: string; content: Content }
  | { type: 'delete'; id: string }
  | { type: 'review'; id: string; item: Vocabulary; remembered: boolean }

export function useVocabulary() {
  return useModuleNotes<Vocabulary>(VOCABULARY_COLLECTION)
}

export function useVocabularyAction() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (action: Action) => {
      if (!user) throw new Error('Not authenticated')
      if (action.type === 'delete') return deleteNote(user.uid, VOCABULARY_COLLECTION, action.id)
      if (action.type === 'review') {
        return updateNote(user.uid, VOCABULARY_COLLECTION, action.id, reviewVocabulary(action.item, action.remembered))
      }
      const content = {
        word: action.content.word.trim(),
        meaning: action.content.meaning.trim(),
        example: action.content.example.trim(),
        phonetic: (action.content.phonetic ?? '').trim()
      }
      if (!content.word || !content.meaning) throw new Error('Required fields are empty')
      if (action.id) return updateNote(user.uid, VOCABULARY_COLLECTION, action.id, content)
      return createNote<Vocabulary>(user.uid, VOCABULARY_COLLECTION, {
        ...content,
        intervalDays: 0,
        nextReviewAt: null,
        lastReviewedAt: null
      })
    }
  })
}
