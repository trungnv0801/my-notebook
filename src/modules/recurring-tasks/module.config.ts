import { Calendar } from 'lucide-react'

import type { AppModule } from '../app-module'
import en from './locales/en'
import vi from './locales/vi'
import { recurringTasksRoutes } from './routes'

export const recurringTasksModule: AppModule = {
  id: 'recurring-tasks',
  path: '/recurring-tasks',
  icon: Calendar,
  labelKey: 'recurring-tasks:title',
  navOrder: 20,
  namespace: 'recurring-tasks',
  collectionName: 'maintenanceTasks',
  element: recurringTasksRoutes.list,
  children: [
    { path: 'new', element: recurringTasksRoutes.create },
    { path: ':taskId/edit', element: recurringTasksRoutes.edit },
    { path: ':taskId', element: recurringTasksRoutes.detail }
  ],
  translations: { en, vi }
}
