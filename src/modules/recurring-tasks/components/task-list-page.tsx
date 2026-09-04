import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Calendar, Plus, Repeat, Trash2 } from 'lucide-react'

import { useAuth } from '@/core/auth/use-auth'
import { formatDate } from '@/core/lib/date-utils'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardTitle, EmptyState } from '@/core/ui/card'
import { PageHeader } from '@/core/ui/page-header'
import { Skeleton } from '@/core/ui/skeleton'
import type { Note } from '@/types/base-note'

import { useLogs } from '../hooks/use-logs'
import { useDeleteTask, useTasks } from '../hooks/use-tasks'
import { describeIntervals } from '../lib/describe-intervals'
import { computeTaskSchedule } from '../lib/schedule'
import type { RecurringLog } from '../types'
import { TaskStatusBadge } from './task-status-badge'

export default function TaskListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('recurring-tasks')
  const tasksQuery = useTasks()
  const logsQuery = useLogs()
  const removeTask = useDeleteTask()
  const [removingId, setRemovingId] = useState<string | null>(null)

  if (tasksQuery.isPending) {
    return (
      <section aria-busy='true' className='space-y-6'>
        <PageHeader subtitle={t('subtitle')} title={t('title')} />
        <div className='grid gap-4 sm:grid-cols-2'>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className='h-44' />
          ))}
        </div>
      </section>
    )
  }

  const tasks = tasksQuery.data ?? []

  const logsByTask = new Map<string, Note<RecurringLog>[]>()
  for (const entry of logsQuery.data ?? []) {
    const bucket = logsByTask.get(entry.taskId)
    if (bucket) bucket.push(entry)
    else logsByTask.set(entry.taskId, [entry])
  }

  return (
    <section className='space-y-6'>
      <PageHeader
        action={
          <Button onClick={() => void navigate('new')}>
            <Plus className='size-4' />
            {t('create.title')}
          </Button>
        }
        subtitle={t('subtitle')}
        title={t('title')}
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<Calendar className='size-5' />}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={<Button onClick={() => void navigate('new')}>{t('create.title')}</Button>}
        />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          {tasks.map((task) => {
            const schedule = computeTaskSchedule(task, logsByTask.get(task.id) ?? [])
            const unit = task.readingLabel ?? t('create.defaultReadingUnit')

            return (
              <Card key={task.id} interactive>
                <div className='flex items-start justify-between gap-2'>
                  <CardTitle className='flex min-w-0 items-center gap-2'>
                    <Repeat className='size-4 shrink-0 text-accent' />
                    <span className='truncate'>{task.name}</span>
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    aria-label={t('actions.delete', { ns: 'common' })}
                    className='text-text/70 hover:bg-danger/10 hover:text-danger'
                    disabled={removeTask.isPending && removingId === task.id}
                    onClick={() => {
                      if (!user) return
                      setRemovingId(task.id)
                      void removeTask.mutateAsync(task.id).finally(() => setRemovingId(null))
                    }}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>

                <div className='mt-2'>
                  <TaskStatusBadge status={schedule.status} />
                </div>

                <CardContent>
                  <dl className='mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5'>
                    <dt className='opacity-70'>{t('list.nextDue')}</dt>
                    <dd>{formatDate(schedule.nextDueAt, i18n.language)}</dd>
                    {schedule.remainingReading != null ? (
                      <>
                        <dt className='opacity-70'>{t('list.remaining')}</dt>
                        <dd>
                          ~{Math.round(schedule.remainingReading).toLocaleString(i18n.language)} {unit}
                        </dd>
                      </>
                    ) : null}
                    <dt className='opacity-70'>{t('list.latestLog')}</dt>
                    <dd>
                      {schedule.latestLogAt == null
                        ? '—'
                        : schedule.latestReading == null
                          ? formatDate(schedule.latestLogAt, i18n.language)
                          : t('detail.lastDoneWithReading', {
                              date: formatDate(schedule.latestLogAt, i18n.language),
                              value: schedule.latestReading.toLocaleString(i18n.language),
                              unit
                            })}
                    </dd>
                  </dl>
                </CardContent>

                <CardContent className='mt-3 text-xs text-text/80'>{describeIntervals(task, t)}</CardContent>

                <CardContent className='mt-3'>
                  <Button size='sm' variant='outline' onClick={() => void navigate(task.id)}>
                    {t('actions.open', { ns: 'common' })}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
