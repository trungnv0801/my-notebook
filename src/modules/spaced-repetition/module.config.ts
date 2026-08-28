import { Brain } from 'lucide-react'

import type { AppModule } from '../app-module'
import en from './locales/en'
import vi from './locales/vi'
import { spacedRepetitionRoutes } from './routes'

export const spacedRepetitionModule: AppModule = {
  id: 'spaced-repetition',
  path: '/spaced-repetition',
  icon: Brain,
  labelKey: 'spaced-repetition:title',
  navOrder: 10,
  namespace: 'spaced-repetition',
  collectionName: 'memoryItems',
  element: spacedRepetitionRoutes.list,
  children: [{ path: 'new', element: spacedRepetitionRoutes.create }],
  translations: { en, vi }
}
