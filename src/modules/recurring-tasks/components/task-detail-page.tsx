import { useState } from 'react'

import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Calendar, Plus, Repeat, Trash2 } from 'lucide-react'

import { useAuth } from '@/core/auth/use-auth'
import { formatDate } from '@/core/lib/date-utils'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardTitle, EmptyState, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { PageHeader } from '@/core/ui/page-header'
import { Skeleton } from '@/core/ui/skeleton'

import { useCreateLog, useDeleteLog, useLogs } from '../hooks/use-logs'
import { useTasks } from '../hooks/use-tasks'
import { describeIntervals } from '../lib/describe-intervals'
import { computeTaskSchedule } from '../lib/schedule'
import { TaskStatusBadge } from './task-status-badge'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('recurring-tasks')
  const tasksQuery = useTasks()
  const logsQuery = useLogs()
  const createLog = useCreateLog()
  const removeLog = useDeleteLog()

  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [logReading, setLogReading] = useState('')
  const [logError, setLogError] = useState<string | null>(null)
  const [removingLogId, setRemovingLogId] = useState<string | null>(null)

  if (tasksQuery.isPending || logsQuery.isPending) {
    return (
      <section aria-busy='true' className='space-y-6'>
        <Skeleton className='h-10 w-72' />
        <Skeleton className='h-40' />
        <Skeleton className='h-56' />
      </section>
    )
  }

  const task = tasksQuery.data?.find((item) => item.id === taskId)

  if (!task) {
    return (
      <section className='space-y-6'>
        <PageHeader subtitle={t('subtitle')} title={t('title')} />
        <EmptyState
          icon={<Calendar className='size-5' />}
          title={t('detail.notFoundTitle')}
          action={<Button onClick={() => void navigate('..')}>{t('actions.back', { ns: 'common' })}</Button>}
        />
      </section>
    )
  }

  // The unit label travels with the task (e.g. "km"), so any metered chore works.
  const unit = task.readingLabel ?? t('create.defaultReadingUnit')
  const taskLogs = (logsQuery.data ?? []).filter((entry) => entry.taskId === task.id)
  const schedule = computeTaskSchedule(task, taskLogs)

  // Reading gained since the previous occurrence, keyed by log id.
  const chronological = [...taskLogs].sort((first, second) => first.performedAt - second.performedAt)
  const deltaByLogId = new Map<string, number>()
  for (let index = 1; index < chronological.length; index += 1) {
    const current = chronological[index]
    const previous = chronological[index - 1]
    if (
      current &&
      previous &&
      current.readingValue != null &&
      previous.readingValue != null &&
      current.readingValue > previous.readingValue
    ) {
      deltaByLogId.set(current.id, current.readingValue - previous.readingValue)
    }
  }
  const historyRows = [...taskLogs].sort((first, second) => second.performedAt - first.performedAt)

  async function handleAddLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!task) return
    const readingValue = task.trackReading ? Number(logReading) : null
    const invalidReading =
      task.trackReading && (logReading.trim() === '' || !Number.isFinite(readingValue) || (readingValue ?? 0) < 0)
    if (!logDate || invalidReading) {
      setLogError(t(task.trackReading ? 'detail.addLog.invalidReading' : 'detail.addLog.invalidDate'))
      return
    }
    setLogError(null)
    try {
      await createLog.mutateAsync({
        taskId: task.id,
        performedAt: logDate,
        ...(task.trackReading && readingValue != null ? { readingValue } : {})
      })
      setLogReading('')
    } catch {
      setLogError(t('form.error', { ns: 'common' }))
    }
  }

  return (
    <section className='space-y-6'>
      <PageHeader
        action={
          <Button variant='outline' onClick={() => void navigate('..')}>
            {t('actions.back', { ns: 'common' })}
          </Button>
        }
        subtitle={describeIntervals(task, t)}
        title={`${task.emoji ? `${task.emoji} ` : ''}${task.name}`}
      />

      {task.notes ? (
        <Card className='p-5'>
          <CardTitle className='flex items-center gap-2'>
            <Repeat className='size-4 text-accent' />
            {t('detail.notesTitle')}
          </CardTitle>
          <CardContent className='whitespace-pre-wrap'>{task.notes}</CardContent>
        </Card>
      ) : null}

      <Card>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2'>
            <Repeat className='size-4 text-accent' />
            {t('detail.summaryTitle')}
          </CardTitle>
          <TaskStatusBadge status={schedule.status} />
        </div>
        <CardContent>
          <dl className='mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3'>
            <dt className='opacity-70'>{t('detail.nextDue')}</dt>
            <dd>{formatDate(schedule.nextDueAt, i18n.language)}</dd>
            {schedule.nextDueReading != null ? (
              <>
                <dt className='opacity-70'>{t('detail.nextDueReading', { unit })}</dt>
                <dd>
                  {schedule.nextDueReading.toLocaleString(i18n.language)} {unit}
                </dd>
              </>
            ) : null}
            {schedule.remainingReading != null ? (
              <>
                <dt className='opacity-70'>{t('detail.remaining')}</dt>
                <dd>
                  ~{Math.round(schedule.remainingReading).toLocaleString(i18n.language)} {unit}
                </dd>
              </>
            ) : null}
            {schedule.avgPerDay != null ? (
              <>
                <dt className='opacity-70'>{t('detail.avgPerDay', { unit })}</dt>
                <dd>~{Math.round(schedule.avgPerDay).toLocaleString(i18n.language)}</dd>
              </>
            ) : null}
            <dt className='opacity-70'>{t('detail.lastDone')}</dt>
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
      </Card>

      <Card>
        <form className='space-y-4' onSubmit={(event) => void handleAddLog(event)} noValidate>
          <CardTitle className='flex items-center gap-2'>
            <Plus className='size-4 text-accent' />
            {t('detail.addLog.title')}
          </CardTitle>
          <div className={`grid gap-4 ${task.trackReading ? 'sm:grid-cols-2' : ''}`}>
            <div className='space-y-1'>
              <Label htmlFor='log-date'>{t('fields.performedAt')}</Label>
              <Input id='log-date' type='date' value={logDate} onChange={(event) => setLogDate(event.target.value)} />
            </div>
            {task.trackReading ? (
              <div className='space-y-1'>
                <Label htmlFor='log-reading'>
                  {t('fields.readingValue')} ({unit})
                </Label>
                <Input
                  id='log-reading'
                  type='number'
                  min='0'
                  step='any'
                  value={logReading}
                  onChange={(event) => setLogReading(event.target.value)}
                />
              </div>
            ) : null}
          </div>
          {logError ? <p className='text-sm text-red-600 dark:text-red-400'>{logError}</p> : null}
          <div className='flex justify-end'>
            <Button type='submit' disabled={createLog.isPending}>
              {createLog.isPending ? t('states.loading', { ns: 'common' }) : t('detail.addLog.submit')}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='size-4 text-accent' />
            {t('detail.history.title')}
          </CardTitle>
          {historyRows.length > 0 ? <span className='text-xs text-text/70'>{historyRows.length}</span> : null}
        </div>

        {historyRows.length === 0 ? (
          <CardContent className='mt-3 text-sm text-text/80'>{t('detail.history.empty')}</CardContent>
        ) : (
          <ul className='mt-2 divide-y divide-border'>
            {historyRows.map((entry) => {
              const deltaReading = deltaByLogId.get(entry.id)

              return (
                <li key={entry.id} className='flex items-center justify-between gap-3 py-3'>
                  <div>
                    <p className='text-sm font-medium text-heading'>{formatDate(entry.performedAt, i18n.language)}</p>
                    {deltaReading != null ? (
                      <p className='text-xs text-text/70'>
                        {t('detail.history.deltaReading', {
                          amount: deltaReading.toLocaleString(i18n.language),
                          unit
                        })}
                      </p>
                    ) : null}
                  </div>
                  <div className='flex items-center gap-2'>
                    {entry.readingValue != null ? (
                      <span className='text-sm tabular-nums text-text'>
                        {entry.readingValue.toLocaleString(i18n.language)} {unit}
                      </span>
                    ) : null}
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label={t('actions.delete', { ns: 'common' })}
                      className='text-text/70 hover:bg-danger/10 hover:text-danger'
                      disabled={removeLog.isPending && removingLogId === entry.id}
                      onClick={() => {
                        if (!user) return
                        setRemovingLogId(entry.id)
                        void removeLog.mutateAsync(entry.id).finally(() => setRemovingLogId(null))
                      }}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </section>
  )
}
