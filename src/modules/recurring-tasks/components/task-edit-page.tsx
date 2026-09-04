import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/core/ui/button'
import { Card, EmptyState, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'
import { Textarea } from '@/core/ui/textarea'
import type { Note } from '@/types/base-note'

import { useTasks, useUpdateTask } from '../hooks/use-tasks'
import type { RecurringTask } from '../types'

const emptyToUndefined = (value: unknown) => (value === '' || value === null || value === undefined ? undefined : value)

const optionalPositiveNumber = z.preprocess(emptyToUndefined, z.coerce.number().positive().optional())
const optionalPositiveInteger = z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional())

const schema = z
  .object({
    name: z.string().min(1),
    notes: z.string().optional(),
    intervalDays: optionalPositiveInteger,
    intervalMonths: optionalPositiveInteger,
    intervalReading: optionalPositiveNumber,
    readingLabel: z.string().optional()
  })
  .refine(
    (value) =>
      value.intervalDays !== undefined || value.intervalMonths !== undefined || value.intervalReading !== undefined,
    { path: ['intervalReading'], message: 'at-least-one-interval' }
  )

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function TaskEditPage() {
  const { taskId } = useParams()
  const { t } = useTranslation('recurring-tasks')
  const tasksQuery = useTasks()
  const task = tasksQuery.data?.find((item) => item.id === taskId)

  if (tasksQuery.isPending) return <Spinner className='mx-auto my-24' />

  if (!task) {
    return (
      <EmptyState
        title={t('edit.notFound')}
        action={
          <Link className='text-accent underline' to='..'>
            {t('actions.back', { ns: 'common' })}
          </Link>
        }
      />
    )
  }

  return <TaskEditForm task={task} />
}

function TaskEditForm({ task }: { task: Note<RecurringTask> }) {
  const navigate = useNavigate()
  const { t } = useTranslation('recurring-tasks')
  const updateTask = useUpdateTask()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: task.name,
      notes: task.notes ?? '',
      intervalDays: task.intervalDays ?? '',
      intervalMonths: task.intervalMonths ?? '',
      intervalReading: task.intervalReading ?? '',
      readingLabel: task.readingLabel ?? ''
    }
  })

  const intervalReadingInput = watch('intervalReading')
  const tracksReading = intervalReadingInput !== undefined && intervalReadingInput !== ''
  const detailPath = `../${task.id}`

  function errorText(key: keyof FormOutput): string | null {
    if (!errors[key]) return null
    if (key === 'intervalDays' || key === 'intervalMonths' || key === 'intervalReading') {
      return t('create.errors.intervalRequired')
    }
    return t('form.required', { ns: 'common' })
  }

  async function onSubmit(values: FormOutput) {
    setFormError(null)
    try {
      const trackReading = values.intervalReading !== undefined
      const readingUnit = (values.readingLabel ?? '').trim() || t('create.defaultReadingUnit')

      await updateTask.mutateAsync({
        taskId: task.id,
        patch: {
          name: values.name,
          notes: (values.notes ?? '').trim() || null,
          intervalDays: values.intervalDays ?? null,
          intervalMonths: values.intervalMonths ?? null,
          trackReading,
          readingLabel: trackReading ? readingUnit : null,
          intervalReading: values.intervalReading ?? null
        }
      })
      void navigate(detailPath)
    } catch {
      setFormError(t('form.error', { ns: 'common' }))
    }
  }

  return (
    <section className='mx-auto max-w-xl space-y-6'>
      <h1 className='font-heading text-2xl font-semibold text-heading'>{t('edit.title')}</h1>

      <Card className='p-6'>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className='space-y-1'>
            <Label htmlFor='name'>{t('fields.name')}</Label>
            <Input id='name' {...register('name')} />
            {errorText('name') ? <p className='text-xs text-red-600 dark:text-red-400'>{errorText('name')}</p> : null}
          </div>

          <div className='space-y-1'>
            <Label htmlFor='notes'>{t('fields.notes')}</Label>
            <Textarea id='notes' rows={2} {...register('notes')} />
          </div>

          <div className='space-y-2 border-t border-border pt-4'>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='space-y-1'>
                <Label htmlFor='intervalDays'>{t('fields.intervalDays')}</Label>
                <Input id='intervalDays' type='number' min='1' step='1' {...register('intervalDays')} />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='intervalMonths'>{t('fields.intervalMonths')}</Label>
                <Input id='intervalMonths' type='number' min='1' step='1' {...register('intervalMonths')} />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='intervalReading'>{t('fields.intervalReading')}</Label>
                <Input id='intervalReading' type='number' min='1' step='any' {...register('intervalReading')} />
                {errorText('intervalReading') ? (
                  <p className='text-xs text-red-600 dark:text-red-400'>{errorText('intervalReading')}</p>
                ) : null}
              </div>
            </div>
            <p className='text-xs text-text/70'>{t('create.intervalsHint')}</p>

            {tracksReading ? (
              <div className='space-y-1 sm:max-w-[calc(50%-0.5rem)]'>
                <Label htmlFor='readingLabel'>{t('fields.readingLabel')}</Label>
                <Input
                  id='readingLabel'
                  maxLength={10}
                  placeholder={t('create.defaultReadingUnit')}
                  {...register('readingLabel')}
                />
                <p className='text-xs text-text/70'>{t('create.readingUnitHint')}</p>
              </div>
            ) : null}
          </div>

          {formError ? <p className='text-sm text-red-600 dark:text-red-400'>{formError}</p> : null}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => void navigate(detailPath)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('states.loading', { ns: 'common' }) : t('edit.submit')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
