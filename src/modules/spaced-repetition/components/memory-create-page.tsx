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

import { useCreateMemory } from '../hooks/use-memories'

const emptyToUndefined = (value: unknown) => (value === '' || value === null || value === undefined ? undefined : value)

const schema = z.object({
  title: z.string().trim(),
  content: z.string().trim().min(1),
  quizUrl: z.preprocess(emptyToUndefined, z.url({ protocol: /^https?$/ }))
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function MemoryCreatePage() {
  const createMemory = useCreateMemory()
  const navigate = useNavigate()
  const { t } = useTranslation('spaced-repetition')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', quizUrl: '' }
  })

  function errorText(field: keyof FormOutput): string | null {
    if (!errors[field]) return null
    if (field === 'quizUrl') return t('create.errors.quizUrl')
    return t('form.required', { ns: 'common' })
  }

  async function onSubmit(values: FormOutput) {
    setFormError(null)
    try {
      await createMemory.mutateAsync({
        title: values.title,
        content: values.content,
        quizUrl: values.quizUrl ?? ''
      })
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
          <div className='space-y-1'>
            <Label htmlFor='title'>{t('fields.title')}</Label>
            <Input id='title' {...register('title')} />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='content'>{t('fields.content')}</Label>
            <Textarea id='content' rows={8} {...register('content')} />
            {errors.content ? <p className='text-xs text-red-600 dark:text-red-400'>{errorText('content')}</p> : null}
          </div>
          <div className='space-y-1'>
            <Label htmlFor='quizUrl'>{t('fields.quizUrl')}</Label>
            <Input id='quizUrl' type='url' placeholder='https://example.com/quiz' {...register('quizUrl')} />
            {errors.quizUrl ? <p className='text-xs text-red-600 dark:text-red-400'>{errorText('quizUrl')}</p> : null}
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
