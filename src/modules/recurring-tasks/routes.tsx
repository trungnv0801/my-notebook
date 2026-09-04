import { lazy } from 'react'

const TaskListPage = lazy(() => import('./components/task-list-page'))
const TaskCreatePage = lazy(() => import('./components/task-create-page'))
const TaskDetailPage = lazy(() => import('./components/task-detail-page'))
const TaskEditPage = lazy(() => import('./components/task-edit-page'))

export const recurringTasksRoutes = {
  list: TaskListPage,
  create: TaskCreatePage,
  detail: TaskDetailPage,
  edit: TaskEditPage
}
