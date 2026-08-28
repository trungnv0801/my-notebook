import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/core/auth/use-auth'
import { useModuleNotes } from '@/core/hooks/use-module-notes'

import type { NewRecurringLogInput } from '../api/logs'
import { addLog, LOGS_COLLECTION, removeLog } from '../api/logs'
import type { RecurringLog } from '../types'

export function useLogs() {
  return useModuleNotes<RecurringLog>(LOGS_COLLECTION)
}

export function useCreateLog() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (input: NewRecurringLogInput) => {
      if (!user) throw new Error('Not authenticated')
      return addLog(user.uid, input)
    }
  })
}

export function useDeleteLog() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: (logId: string) => {
      if (!user) throw new Error('Not authenticated')
      return removeLog(user.uid, logId)
    }
  })
}
