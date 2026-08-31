import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'

import { useAuth } from '@/core/auth/use-auth'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardTitle, EmptyState } from '@/core/ui/card'
import { PageHeader } from '@/core/ui/page-header'
import { Skeleton } from '@/core/ui/skeleton'

import { useDeletePdf, useDocuments } from '../hooks/use-documents'
import { getPdfUrl } from '../lib/pdf-url'

export default function DocumentListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('pdf-reader')
  const documentsQuery = useDocuments()
  const removePdf = useDeletePdf()
  const [removingId, setRemovingId] = useState<string | null>(null)

  if (documentsQuery.isPending) {
    return (
      <section aria-busy='true' className='space-y-6'>
        <PageHeader subtitle={t('subtitle')} title={t('title')} />
        <div className='grid gap-4 sm:grid-cols-2'>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className='h-40' />
          ))}
        </div>
      </section>
    )
  }

  const documents = documentsQuery.data ?? []

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

      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText className='size-5' />}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={<Button onClick={() => void navigate('new')}>{t('create.title')}</Button>}
        />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          {documents.map((document) => (
            <Card key={document.id} interactive>
              <div className='flex items-start justify-between gap-2'>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='size-4 text-accent' />
                  {document.title}
                </CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  aria-label={t('actions.delete', { ns: 'common' })}
                  className='text-text/70 hover:bg-danger/10 hover:text-danger'
                  disabled={removePdf.isPending && removingId === document.id}
                  onClick={() => {
                    if (!user) return
                    setRemovingId(document.id)
                    void removePdf.mutateAsync(document.id).finally(() => setRemovingId(null))
                  }}
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
              <CardContent>
                {document.totalPages
                  ? t('list.progress', { page: document.lastReadPage, total: document.totalPages })
                  : t('list.progressUnknown', { page: document.lastReadPage })}
              </CardContent>
              <CardContent className='mt-3'>
                <div className='flex gap-2'>
                  <OpenDocumentButton initialPage={document.lastReadPage} url={document.url} />
                  <Button size='sm' variant='ghost' onClick={() => void navigate(`${document.id}/edit`)}>
                    <Pencil className='size-4' />
                    {t('edit.action')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

function OpenDocumentButton({ url, initialPage }: { url: string; initialPage: number }) {
  const { t } = useTranslation('pdf-reader')
  const href = getPdfUrl(url, initialPage)

  return (
    <Button size='sm' variant='outline' onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}>
      {t('actions.open', { ns: 'common' })}
    </Button>
  )
}
