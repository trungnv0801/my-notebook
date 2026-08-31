import { lazy } from 'react'

const MemoryListPage = lazy(() => import('./components/memory-list-page'))
const MemoryCreatePage = lazy(() => import('./components/memory-create-page'))
const MemoryEditPage = lazy(() => import('./components/memory-edit-page'))

export const spacedRepetitionRoutes = {
  list: MemoryListPage,
  create: MemoryCreatePage,
  edit: MemoryEditPage
}
