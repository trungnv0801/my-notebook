import { createNote, deleteNote, updateNote } from '@/core/firebase/crud'

import type { PdfDocument } from '../types'

export const PDF_COLLECTION = 'pdfDocuments'

export function addPdf(uid: string, input: Omit<PdfDocument, 'lastReadPage'>): Promise<string> {
  return createNote<PdfDocument>(uid, PDF_COLLECTION, {
    ...input,
    lastReadPage: 1
  })
}

export function removePdf(uid: string, documentId: string): Promise<void> {
  return deleteNote(uid, PDF_COLLECTION, documentId)
}

export function updatePdf(uid: string, documentId: string, patch: Partial<PdfDocument>): Promise<void> {
  return updateNote(uid, PDF_COLLECTION, documentId, { ...patch })
}
