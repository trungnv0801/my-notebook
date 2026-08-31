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
import type { Note } from '@/types/base-note'

import { useDocuments, useUpdatePdf } from '../hooks/use-documents'
import type { PdfDocument } from '../types'

const schema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  lastReadPage: z.coerce.number().int().positive()
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function DocumentEditPage() {
  const { documentId } = useParams()
  const { t } = useTranslation('pdf-reader')
  const documentsQuery = useDocuments()
  const document = documentsQuery.data?.find((item) => item.id === documentId)

  if (documentsQuery.isPending) return <Spinner className='mx-auto my-24' />

  if (!document) {
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

  return <DocumentEditForm document={document} />
}

function DocumentEditForm({ document }: { document: Note<PdfDocument> }) {
  const navigate = useNavigate()
  const { t } = useTranslation('pdf-reader')
  const updatePdf = useUpdatePdf()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: document.title,
      url: document.url,
      lastReadPage: document.lastReadPage
    }
  })

  async function onSubmit(values: FormOutput) {
    setFormError(null)
    const urlChanged = values.url !== document.url
    const lastReadPage = urlChanged
      ? values.lastReadPage
      : Math.min(values.lastReadPage, document.totalPages ?? Number.POSITIVE_INFINITY)

    try {
      await updatePdf.mutateAsync({
        documentId: document.id,
        patch: {
          title: values.title,
          url: values.url,
          lastReadPage,
          ...(urlChanged ? { totalPages: null } : {})
        }
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
      <h1 className='font-heading text-2xl font-semibold text-heading'>{t('edit.title')}</h1>

      <Card className='p-6'>
        <form className='space-y-4' noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-1'>
            <Label htmlFor='title'>{t('fields.title')}</Label>
            <Input id='title' {...register('title')} />
            {requiredError('title') ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{requiredError('title')}</p>
            ) : null}
          </div>

          <div className='space-y-1'>
            <Label htmlFor='url'>{t('fields.url')}</Label>
            <Input id='url' type='url' {...register('url')} />
            {requiredError('url') ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{requiredError('url')}</p>
            ) : null}
          </div>

          <div className='space-y-1'>
            <Label htmlFor='lastReadPage'>{t('fields.lastReadPage')}</Label>
            <Input
              id='lastReadPage'
              max={document.totalPages ?? undefined}
              min='1'
              step='1'
              type='number'
              {...register('lastReadPage')}
            />
            {requiredError('lastReadPage') ? (
              <p className='text-xs text-red-600 dark:text-red-400'>{requiredError('lastReadPage')}</p>
            ) : null}
          </div>

          {formError ? <p className='text-sm text-red-600 dark:text-red-400'>{formError}</p> : null}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => void navigate('..')}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? t('states.loading', { ns: 'common' }) : t('edit.submit')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
