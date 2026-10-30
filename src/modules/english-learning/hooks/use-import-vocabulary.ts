import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'

import { importVocabulary } from '../api/import-vocabulary'
import type { VocabularyContent } from '../types'

export function useImportVocabulary() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (rows: VocabularyContent[]) => {
      if (!user) throw new Error('Not authenticated')
      return importVocabulary(user.uid, rows)
    }
  })
}
