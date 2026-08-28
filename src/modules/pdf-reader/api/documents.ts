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

export function saveProgress(uid: string, documentId: string, page: number): Promise<void> {
  return updateNote(uid, PDF_COLLECTION, documentId, { lastReadPage: page })
}

/** Persist the real total page count once pdf.js has parsed the document. */
export function saveTotalPages(uid: string, documentId: string, totalPages: number): Promise<void> {
  return updateNote(uid, PDF_COLLECTION, documentId, { totalPages })
}
