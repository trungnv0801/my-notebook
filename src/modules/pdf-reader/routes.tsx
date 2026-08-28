import { lazy } from 'react'

const DocumentListPage = lazy(() => import('./components/document-list-page'))
const DocumentCreatePage = lazy(() => import('./components/document-create-page'))
const DocumentViewPage = lazy(() => import('./components/document-view-page'))

export const pdfReaderRoutes = {
  list: DocumentListPage,
  create: DocumentCreatePage,
  view: DocumentViewPage
}
