import { useState } from 'react'

import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'

const schema = z.object({
  title: z.string().trim().min(1),
  practiceLinks: z
    .array(z.object({ url: z.url({ protocol: /^https?$/ }) }))
    .min(1)
    .max(10)
})

type FormInput = z.input<typeof schema>
export type MemoryFormValues = z.output<typeof schema>

interface MemoryFormProps {
  title: string
  submitLabel: string
  defaultValues: MemoryFormValues
  onCancel: () => void
  onSubmit: (values: MemoryFormValues) => Promise<void>
}

export function MemoryForm({ title, submitLabel, defaultValues, onCancel, onSubmit }: MemoryFormProps) {
  const { t } = useTranslation('spaced-repetition')
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, MemoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'practiceLinks' })

  async function submit(values: MemoryFormValues) {
    setFormError(null)
    try {
      await onSubmit(values)
    } catch {
      setFormError(t('form.error', { ns: 'common' }))
    }
  }

  return (
    <section className='mx-auto max-w-xl space-y-6'>
      <h1 className='font-heading text-2xl font-semibold text-heading'>{title}</h1>

      <Card className='p-6'>
        <form className='space-y-4' onSubmit={handleSubmit(submit)} noValidate>
          <div className='space-y-1'>
            <Label htmlFor='title'>{t('fields.title')}</Label>
            <Input id='title' {...register('title')} />
            {errors.title ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{t('form.required', { ns: 'common' })}</p>
            ) : null}
          </div>

          <div className='space-y-3'>
            <Label>{t('fields.practiceUrls')}</Label>
            {fields.map((field, index) => (
              <div key={field.id} className='space-y-1'>
                <div className='flex gap-2'>
                  <Input
                    aria-label={t('fields.practiceUrlNumber', { number: index + 1 })}
                    type='url'
                    placeholder='https://example.com/practice'
                    {...register(`practiceLinks.${index}.url`)}
                  />
                  {fields.length > 1 ? (
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label={t('memoryForm.removePracticeLink', { number: index + 1 })}
                      className='shrink-0 text-text/70 hover:bg-danger/10 hover:text-danger'
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  ) : null}
                </div>
                {errors.practiceLinks?.[index]?.url ? (
                  <p className='text-xs text-red-600 dark:text-red-400'>{t('memoryForm.errors.practiceUrl')}</p>
                ) : null}
              </div>
            ))}
            <Button variant='outline' size='sm' disabled={fields.length >= 10} onClick={() => append({ url: '' })}>
              <Plus className='size-4' />
              {t('memoryForm.addPracticeLink')}
            </Button>
          </div>

          {formError ? <p className='text-sm text-red-600 dark:text-red-400'>{formError}</p> : null}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onCancel}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('states.loading', { ns: 'common' }) : submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
