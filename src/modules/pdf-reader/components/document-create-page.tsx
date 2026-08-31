import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'

import { useCreatePdf } from '../hooks/use-documents'

const schema = z.object({
  title: z.string().min(1),
  url: z.string().url()
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function DocumentCreatePage() {
  const createPdf = useCreatePdf()
  const navigate = useNavigate()
  const { t } = useTranslation('pdf-reader')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', url: '' }
  })

  async function onSubmit(values: FormOutput) {
    setFormError(null)
    try {
      await createPdf.mutateAsync({
        title: values.title,
        url: values.url,
        totalPages: null
      })
      void navigate('..')
    } catch {
      setFormError(t('form.error', { ns: 'common' }))
    }
  }

  function requiredError(key: keyof FormInput): string | null {
    return errors[key] ? t('form.required', { ns: 'common' }) : null
  }

  return (
    <section className='mx-auto max-w-xl space-y-6'>
      <h1 className='font-heading text-2xl font-semibold text-heading'>{t('create.title')}</h1>

      <Card className='p-6'>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className='space-y-1'>
            <Label htmlFor='title'>{t('fields.title')}</Label>
            <Input id='title' {...register('title')} />
            {requiredError('title') ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{requiredError('title')}</p>
            ) : null}
          </div>
          <div className='space-y-1'>
            <Label htmlFor='url'>{t('fields.url')}</Label>
            <Input id='url' type='url' placeholder='https://…/document.pdf' {...register('url')} />
            {requiredError('url') ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{requiredError('url')}</p>
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
