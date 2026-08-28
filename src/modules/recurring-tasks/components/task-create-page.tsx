import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Textarea } from '@/core/ui/textarea'

import { useCreateLog } from '../hooks/use-logs'
import { useCreateTask } from '../hooks/use-tasks'

const emptyToUndefined = (value: unknown) => (value === '' || value === null || value === undefined ? undefined : value)

const optionalPositiveNumber = z.preprocess(emptyToUndefined, z.coerce.number().positive().optional())
const optionalPositiveInteger = z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional())
const optionalNonNegativeNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional())

const schema = z
  .object({
    name: z.string().min(1),
    emoji: z.string().optional(),
    notes: z.string().optional(),
    intervalDays: optionalPositiveInteger,
    intervalMonths: optionalPositiveInteger,
    intervalReading: optionalPositiveNumber,
    readingLabel: z.string().optional(),
    firstPerformedAt: z.string().optional(),
    firstReadingValue: optionalNonNegativeNumber
  })
  // Any mix of intervals is fine — days, months, usage — as long as one is set.
  .refine(
    (value) =>
      value.intervalDays !== undefined || value.intervalMonths !== undefined || value.intervalReading !== undefined,
    { path: ['intervalReading'], message: 'at-least-one-interval' }
  )
  // Only when the task tracks a meter must the first entry pair date + reading.
  .refine(
    (value) =>
      value.intervalReading === undefined ||
      Boolean(value.firstPerformedAt) === (value.firstReadingValue !== undefined),
    { path: ['firstReadingValue'], message: 'first-record-incomplete' }
  )

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function TaskCreatePage() {
  const createTask = useCreateTask()
  const createLog = useCreateLog()
  const navigate = useNavigate()
  const { t } = useTranslation('recurring-tasks')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      emoji: '',
      notes: '',
      intervalDays: '',
      intervalMonths: '',
      intervalReading: '',
      readingLabel: '',
      firstPerformedAt: '',
      firstReadingValue: ''
    }
  })

  // Usage-unit and first-reading inputs appear only once a usage interval is filled.
  const intervalReadingInput = watch('intervalReading')
  const tracksReading = intervalReadingInput !== undefined && intervalReadingInput !== ''

  function errorText(key: keyof FormOutput): string | null {
    if (!errors[key]) return null
    if (key === 'intervalDays' || key === 'intervalMonths' || key === 'intervalReading') {
      return t('create.errors.intervalRequired')
    }
    if (key === 'firstReadingValue' || key === 'firstPerformedAt') {
      return t('create.errors.firstRecordIncomplete')
    }
    return t('form.required', { ns: 'common' })
  }

  async function onSubmit(values: FormOutput) {
    setFormError(null)
    try {
      const trackReading = values.intervalReading !== undefined
      const readingUnit = (values.readingLabel ?? '').trim() || t('create.defaultReadingUnit')

      const taskId = await createTask.mutateAsync({
        name: values.name,
        emoji: (values.emoji ?? '').trim() || null,
        notes: (values.notes ?? '').trim() || null,
        intervalDays: values.intervalDays ?? null,
        intervalMonths: values.intervalMonths ?? null,
        trackReading,
        readingLabel: trackReading ? readingUnit : null,
        intervalReading: values.intervalReading ?? null
      })

      if (values.firstPerformedAt && (!trackReading || values.firstReadingValue !== undefined)) {
        await createLog.mutateAsync({
          taskId,
          performedAt: values.firstPerformedAt,
          ...(trackReading && values.firstReadingValue !== undefined ? { readingValue: values.firstReadingValue } : {})
        })
      }

      void navigate('..')
    } catch {
      setFormError(t('form.error', { ns: 'common' }))
    }
  }

  return (
    <section className='mx-auto max-w-xl space-y-6'>
      <h1 className='font-heading text-2xl font-semibold text-heading'>{t('create.title')}</h1>

      <Card className='p-6'>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className='grid gap-4 sm:grid-cols-[1fr_7rem]'>
            <div className='space-y-1'>
              <Label htmlFor='name'>{t('fields.name')}</Label>
              <Input id='name' placeholder={t('create.namePlaceholder')} {...register('name')} />
              {errorText('name') ? <p className='text-xs text-red-600 dark:text-red-400'>{errorText('name')}</p> : null}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='emoji'>{t('fields.emoji')}</Label>
              <Input id='emoji' maxLength={4} placeholder='🦷' {...register('emoji')} />
            </div>
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
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <Label htmlFor='readingLabel'>{t('fields.readingLabel')}</Label>
                  <Input
                    id='readingLabel'
                    maxLength={10}
                    placeholder={t('create.defaultReadingUnit')}
                    {...register('readingLabel')}
                  />
                  <p className='text-xs text-text/70'>{t('create.readingUnitHint')}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className='space-y-3 border-t border-border pt-4'>
            <div>
              <p className='text-sm font-medium text-heading'>{t('create.firstRecordTitle')}</p>
              <p className='text-xs text-text/80'>{t('create.firstRecordHint')}</p>
            </div>
            <div className={`grid gap-4 ${tracksReading ? 'sm:grid-cols-2' : ''}`}>
              <div className='space-y-1'>
                <Label htmlFor='firstPerformedAt'>{t('fields.performedAt')}</Label>
                <Input id='firstPerformedAt' type='date' {...register('firstPerformedAt')} />
              </div>
              {tracksReading ? (
                <div className='space-y-1'>
                  <Label htmlFor='firstReadingValue'>{t('fields.readingValue')}</Label>
                  <Input id='firstReadingValue' type='number' min='0' step='any' {...register('firstReadingValue')} />
                </div>
              ) : null}
            </div>
            {(errorText('firstReadingValue') ?? errorText('firstPerformedAt')) ? (
              <p className='text-xs text-red-600 dark:text-red-400'>
                {errorText('firstReadingValue') ?? errorText('firstPerformedAt')}
              </p>
            ) : null}
          </div>

          {formError ? <p className='text-sm text-red-600 dark:text-red-400'>{formError}</p> : null}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => void navigate('..')}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('states.loading', { ns: 'common' }) : t('create.submit')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
