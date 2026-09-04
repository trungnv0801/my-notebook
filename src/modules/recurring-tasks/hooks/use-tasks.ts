import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { useModuleNotes } from '@/core/hooks/use-module-notes'

import type { NewRecurringTaskInput } from '../api/tasks'
import { addTask, removeTask, TASKS_COLLECTION, updateTask } from '../api/tasks'
import type { RecurringTask } from '../types'

export function useTasks() {
  return useModuleNotes<RecurringTask>(TASKS_COLLECTION)
}

export function useCreateTask() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: NewRecurringTaskInput) => {
      if (!user) throw new Error('Not authenticated')
      return addTask(user.uid, input)
    }
  })
}

export interface UpdateTaskInput {
  taskId: string
  patch: Partial<RecurringTask>
}

export function useUpdateTask() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ taskId, patch }: UpdateTaskInput) => {
      if (!user) throw new Error('Not authenticated')
      return updateTask(user.uid, taskId, patch)
    }
  })
}

export function useDeleteTask() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (taskId: string) => {
      if (!user) throw new Error('Not authenticated')
      return removeTask(user.uid, taskId)
    }
  })
}
