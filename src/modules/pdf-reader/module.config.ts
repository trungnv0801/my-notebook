import { FileText } from 'lucide-react'

import type { AppModule } from '../app-module'
import en from './locales/en'
import vi from './locales/vi'
import { pdfReaderRoutes } from './routes'

export const pdfReaderModule: AppModule = {
  id: 'pdf-reader',
  path: '/pdf-reader',
  icon: FileText,
  labelKey: 'pdf-reader:title',
  navOrder: 30,
  namespace: 'pdf-reader',
  collectionName: 'pdfDocuments',
  element: pdfReaderRoutes.list,
  children: [
    { path: 'new', element: pdfReaderRoutes.create },
    { path: ':documentId', element: pdfReaderRoutes.view }
  ],
  translations: { en, vi }
}
