import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { useModuleNotes } from '@/core/hooks/use-module-notes'

import { addPdf, PDF_COLLECTION, removePdf, saveProgress, saveTotalPages } from '../api/documents'
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

export function useSaveProgress() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ documentId, page }: { documentId: string; page: number }) => {
      if (!user) throw new Error('Not authenticated')
      return saveProgress(user.uid, documentId, page)
    }
  })
}

export function useSaveTotalPages() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ documentId, totalPages }: { documentId: string; totalPages: number }) => {
      if (!user) throw new Error('Not authenticated')
      return saveTotalPages(user.uid, documentId, totalPages)
    }
  })
}
