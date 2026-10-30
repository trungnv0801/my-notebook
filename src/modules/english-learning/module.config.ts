import { lazy } from 'react'

import { Languages } from 'lucide-react'

import type { AppModule } from '../app-module'
import en from './locales/en'
import vi from './locales/vi'

export const englishLearningModule: AppModule = {
  id: 'english-learning',
  path: '/english-learning',
  icon: Languages,
  labelKey: 'english-learning:title',
  navOrder: 40,
  namespace: 'english-learning',
  collectionName: 'englishVocabulary',
  element: lazy(() => import('./components/english-learning-page')),
  translations: { en, vi }
}
