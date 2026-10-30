import { type ChangeEvent, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Minimize2, Save } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { EmptyState } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'
import type { Note } from '@/types/base-note'

import { useDocuments, useUpdatePdf } from '../hooks/use-documents'
import { getPdfUrl } from '../lib/pdf-url'
import type { PdfDocument } from '../types'

export default function DocumentReaderPage() {
  const { documentId } = useParams()
  const { t } = useTranslation('pdf-reader')
  const documentsQuery = useDocuments()
  const pdfDocument = documentsQuery.data?.find((item) => item.id === documentId)

  if (documentsQuery.isPending) return <Spinner className='mx-auto my-24' />

  if (!pdfDocument) {
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

  return <DocumentReader document={pdfDocument} />
}

function DocumentReader({ document }: { document: Note<PdfDocument> }) {
  const { t } = useTranslation('pdf-reader')
  const updatePdf = useUpdatePdf()
  const viewerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(document.lastReadPage)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const maximumPage = document.totalPages ?? Number.POSITIVE_INFINITY
  const pdfUrl = getPdfUrl(document.url, page)

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(window.document.fullscreenElement === viewerRef.current)
    }

    window.document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  function goToPage(nextPage: number) {
    setSaved(false)
    setOperationError(null)
    setPage(Math.min(maximumPage, Math.max(1, Math.floor(nextPage))))
  }

  function handlePageChange(event: ChangeEvent<HTMLInputElement>) {
    const nextPage = event.currentTarget.valueAsNumber
    if (Number.isFinite(nextPage)) goToPage(nextPage)
  }

  async function toggleFullscreen() {
    if (!viewerRef.current) return

    setOperationError(null)
    try {
      if (window.document.fullscreenElement) {
        await window.document.exitFullscreen()
      } else {
        await viewerRef.current.requestFullscreen()
      }
    } catch {
      setOperationError(t('reader.fullscreenError'))
    }
  }

  async function saveProgress() {
    setOperationError(null)
    try {
      await updatePdf.mutateAsync({ documentId: document.id, patch: { lastReadPage: page } })
      setSaved(true)
    } catch {
      setOperationError(t('form.error', { ns: 'common' }))
    }
  }

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='min-w-0'>
          <Link className='text-sm text-accent hover:underline' to='..'>
            ← {t('actions.back', { ns: 'common' })}
          </Link>
          <h1 className='truncate font-heading text-2xl font-semibold text-heading'>{document.title}</h1>
        </div>
        <a
          className='inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline'
          href={pdfUrl}
          rel='noreferrer'
          target='_blank'
        >
          <ExternalLink className='size-4' />
          {t('reader.openExternally')}
        </a>
      </div>

      <div
        ref={viewerRef}
        className='flex h-[calc(100svh-13rem)] min-h-96 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm fullscreen:h-screen fullscreen:min-h-0 fullscreen:rounded-none fullscreen:border-0'
      >
        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2'>
          <div className='flex items-center gap-1'>
            <Button
              aria-label={t('reader.previousPage')}
              disabled={page <= 1}
              size='sm'
              variant='ghost'
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <label className='flex items-center gap-2 text-sm' htmlFor='pdf-page'>
              {t('reader.page')}
              <Input
                aria-label={t('reader.page')}
                className='h-9 w-20'
                id='pdf-page'
                max={document.totalPages ?? undefined}
                min='1'
                type='number'
                value={page}
                onChange={handlePageChange}
              />
              {document.totalPages ? <span>/ {document.totalPages}</span> : null}
            </label>
            <Button
              aria-label={t('reader.nextPage')}
              disabled={page >= maximumPage}
              size='sm'
              variant='ghost'
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              disabled={updatePdf.isPending || saved}
              size='sm'
              variant='ghost'
              onClick={() => void saveProgress()}
            >
              <Save className='size-4' />
              <span className='hidden sm:inline'>{saved ? t('reader.progressSaved') : t('reader.saveProgress')}</span>
            </Button>
            <Button
              aria-label={isFullscreen ? t('reader.exitFullscreen') : t('reader.enterFullscreen')}
              size='sm'
              variant='outline'
              onClick={() => void toggleFullscreen()}
            >
              {isFullscreen ? <Minimize2 className='size-4' /> : <Maximize2 className='size-4' />}
              <span className='hidden sm:inline'>
                {isFullscreen ? t('reader.exitFullscreen') : t('reader.enterFullscreen')}
              </span>
            </Button>
          </div>
        </div>

        {operationError ? (
          <p className='border-b border-border bg-danger/10 px-3 py-2 text-sm text-danger' role='alert'>
            {operationError}
          </p>
        ) : null}

        <iframe
          allowFullScreen
          className='min-h-0 w-full flex-1 bg-surface-2'
          src={pdfUrl}
          title={t('reader.frameTitle', { title: document.title })}
        />
      </div>

      <p className='text-xs text-text/70'>{t('reader.embedHint')}</p>
    </section>
  )
}
