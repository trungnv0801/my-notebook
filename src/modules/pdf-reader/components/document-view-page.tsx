import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { Button } from '@/core/ui/button'
import { EmptyState } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'

import { useDocuments, useSaveProgress, useSaveTotalPages } from '../hooks/use-documents'
import PdfViewer from './pdf-viewer'

export default function DocumentViewPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('pdf-reader')
  const documentsQuery = useDocuments()
  const saveProgress = useSaveProgress()
  const saveTotalPages = useSaveTotalPages()

  const document = documentsQuery.data?.find((item) => item.id === documentId)
  const [requestedPage, setRequestedPage] = useState<number | null>(null)
  const [detectedTotalPages, setDetectedTotalPages] = useState<number | null>(null)
  const page = requestedPage ?? Math.max(document?.lastReadPage ?? 1, 1)

  if (documentsQuery.isPending) {
    return <Spinner className='mx-auto my-24' />
  }

  if (!document) {
    return (
      <EmptyState
        title={t('view.notFound')}
        action={
          <Link to='..' className='text-accent underline'>
            {t('actions.back', { ns: 'common' })}
          </Link>
        }
      />
    )
  }

  // pdf.js knows the real page count — prefer it over the manually entered one.
  const totalPages = detectedTotalPages ?? document.totalPages

  function handlePageChange(next: number) {
    if (!documentId || next < 1) return
    setRequestedPage(next)
    void saveProgress.mutateAsync({ documentId, page: next }).catch(() => undefined)
  }

  function handlePageCount(count: number) {
    setDetectedTotalPages(count)
    if (!documentId || count === document?.totalPages) return
    void saveTotalPages.mutateAsync({ documentId, totalPages: count }).catch(() => undefined)
  }

  return (
    <section className='space-y-4'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-heading text-2xl font-semibold text-heading'>{document.title}</h1>
          <p className='text-sm text-text'>
            {totalPages ? t('view.pageOf', { page, total: totalPages }) : t('view.page', { page })}
            {saveProgress.isPending || saveTotalPages.isPending ? ` · ${t('states.loading', { ns: 'common' })}` : ''}
          </p>
        </div>
        <Button variant='ghost' size='sm' onClick={() => void navigate('..')}>
          {t('actions.back', { ns: 'common' })}
        </Button>
      </header>

      <PdfViewer
        key={document.id}
        initialPage={page}
        url={document.url}
        onPageChange={handlePageChange}
        onPageCount={handlePageCount}
      />
    </section>
  )
}
