import { lazy } from 'react'

const DocumentListPage = lazy(() => import('./components/document-list-page'))
const DocumentCreatePage = lazy(() => import('./components/document-create-page'))
const DocumentEditPage = lazy(() => import('./components/document-edit-page'))
const DocumentReaderPage = lazy(() => import('./components/document-reader-page'))

export const pdfReaderRoutes = {
  list: DocumentListPage,
  create: DocumentCreatePage,
  edit: DocumentEditPage,
  reader: DocumentReaderPage
}
