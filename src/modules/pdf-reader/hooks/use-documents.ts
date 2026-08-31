import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { useModuleNotes } from '@/core/hooks/use-module-notes'

import { addPdf, PDF_COLLECTION, removePdf, updatePdf } from '../api/documents'
import type { PdfDocument } from '../types'

export function useDocuments() {
  return useModuleNotes<PdfDocument>(PDF_COLLECTION)
}

export function useCreatePdf() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: Omit<PdfDocument, 'lastReadPage'>) => {
      if (!user) throw new Error('Not authenticated')
      return addPdf(user.uid, input)
    }
  })
}

export function useDeletePdf() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (documentId: string) => {
      if (!user) throw new Error('Not authenticated')
      return removePdf(user.uid, documentId)
    }
  })
}

export function useUpdatePdf() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ documentId, patch }: { documentId: string; patch: Partial<PdfDocument> }) => {
      if (!user) throw new Error('Not authenticated')
      return updatePdf(user.uid, documentId, patch)
    }
  })
}
