import { useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Bell, BellRing } from 'lucide-react'

import { formatDate } from '@/core/lib/date-utils'
import { Button } from '@/core/ui/button'
import type { Note } from '@/types/base-note'

import { useLogs } from '../hooks/use-logs'
import { useTasks } from '../hooks/use-tasks'
import { collectReminders } from '../lib/reminders'
import { DUE_SOON_DAYS } from '../lib/schedule'
import type { RecurringLog } from '../types'
import { TaskStatusBadge } from './task-status-badge'

/**
 * In-app notification center: a header bell listing every recurring task that
 * is overdue or due soon — works for any task shape without per-type code.
 */
export function ReminderBell() {
  const { t, i18n } = useTranslation('recurring-tasks')
  const navigate = useNavigate()
  const tasksQuery = useTasks()
  const logsQuery = useLogs()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const reminders = useMemo(() => {
    const logsByTask = new Map<string, Note<RecurringLog>[]>()
    for (const entry of logsQuery.data ?? []) {
      const bucket = logsByTask.get(entry.taskId)
      if (bucket) bucket.push(entry)
      else logsByTask.set(entry.taskId, [entry])
    }
    return collectReminders(tasksQuery.data ?? [], logsByTask)
  }, [tasksQuery.data, logsQuery.data])

  useEffect(() => {
    if (!open) return undefined
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const hasReminders = reminders.length > 0

  return (
    <div ref={containerRef} className='relative'>
      <Button
        variant='ghost'
        size='sm'
        aria-label={t('notifications.open')}
        title={hasReminders ? t('notifications.countBadge', { count: reminders.length }) : t('notifications.open')}
        onClick={() => setOpen((value) => !value)}
      >
        {hasReminders ? <BellRing className='size-5 text-warning' /> : <Bell className='size-5' />}
        {hasReminders ? (
          <span
            aria-hidden='true'
            className='absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-danger text-[10px] font-bold leading-none text-white'
          >
            {reminders.length > 9 ? '9+' : reminders.length}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className='absolute right-0 top-11 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-3 shadow-lg'>
          <p className='px-1 pb-2 text-sm font-semibold text-heading'>{t('notifications.panelTitle')}</p>
          {!hasReminders ? (
            <p className='px-1 py-3 text-xs text-text/80'>
              {t('notifications.emptyTitle')} — {t('notifications.emptyDescription', { days: DUE_SOON_DAYS })}
            </p>
          ) : (
            <ul className='max-h-72 divide-y divide-border overflow-y-auto'>
              {reminders.map((reminder) => (
                <li key={reminder.taskId}>
                  <button
                    type='button'
                    className='flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2'
                    onClick={() => {
                      setOpen(false)
                      void navigate(`/recurring-tasks/${reminder.taskId}`)
                    }}
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-medium text-heading'>
                        {reminder.emoji ? `${reminder.emoji} ` : ''}
                        {reminder.name}
                      </span>
                      <span className='text-xs text-text/70'>{formatDate(reminder.nextDueAt, i18n.language)}</span>
                    </span>
                    <TaskStatusBadge status={reminder.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
