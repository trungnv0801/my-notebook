import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { cn } from '@/core/ui/cn'
import { Spinner } from '@/core/ui/spinner'

import { clampPage, computeFitScale, MAX_ZOOM, MIN_ZOOM, stepZoom } from '../lib/pdf-utils'
import pdfjs, { type PDFDocumentProxy, type RenderTask } from '../lib/pdfjs'

interface PdfViewerProps {
  url: string
  initialPage?: number
  onPageCount?: (totalPages: number) => void
  onPageChange?: (page: number) => void
  className?: string
}

const MAX_OUTPUT_SCALE = 2

/**
 * In-browser PDF renderer built on pdf.js: draws one page at a time onto a
 * canvas sized to fit the container width (scaled up by devicePixelRatio for
 * crispness), with prev/next + zoom controls, arrow-key navigation and
 * loading/error states. Works on mobile browsers too — no native embed needed.
 */
export default function PdfViewer(props: PdfViewerProps) {
  // Remounting per URL resets every piece of viewer state (page, zoom,
  // statuses) declaratively instead of resetting it inside effects.
  return <PdfViewerDocument key={props.url} {...props} />
}

function PdfViewerDocument({ url, initialPage = 1, onPageCount, onPageChange, className }: PdfViewerProps) {
  const { t } = useTranslation('pdf-reader')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(() => clampPage(initialPage, null))
  const [zoom, setZoom] = useState(1)
  const [rendering, setRendering] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const documentRef = useRef<PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  // Latest-value refs let inline callbacks change every render without
  // re-triggering the load/render effects below.
  const initialPageRef = useRef(initialPage)
  const onPageCountRef = useRef(onPageCount)
  const onPageChangeRef = useRef(onPageChange)
  useEffect(() => {
    initialPageRef.current = initialPage
    onPageCountRef.current = onPageCount
    onPageChangeRef.current = onPageChange
  }, [initialPage, onPageCount, onPageChange])

  // Load the document once per mount (the wrapper remounts us per URL) and
  // destroy it again on unmount. State updates happen only in async callbacks.
  useEffect(() => {
    let cancelled = false

    const task = pdfjs.getDocument({ url })
    task.promise
      .then((loaded) => {
        if (cancelled) return
        documentRef.current = loaded
        setNumPages(loaded.numPages)
        setCurrentPage(clampPage(initialPageRef.current, loaded.numPages))
        setStatus('ready')
        onPageCountRef.current?.(loaded.numPages)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('pdf-reader: failed to load PDF', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
      documentRef.current = null
      renderTaskRef.current = null
      void task.destroy()
    }
  }, [url])

  // Track the available drawing width so pages always fit their container.
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setContainerWidth(Math.floor(width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const goToPage = useCallback(
    (next: number) => {
      if (!numPages) return
      const target = clampPage(next, numPages)
      if (target === currentPage) return
      setCurrentPage(target)
      onPageChangeRef.current?.(target)
    },
    [currentPage, numPages]
  )

  // Arrow / page keys flip pages while the viewer is mounted.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        goToPage(currentPage - 1)
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        goToPage(currentPage + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentPage, goToPage])

  // Draw the active page; re-runs on navigation, zoom and container resize.
  useEffect(() => {
    const pdf = documentRef.current
    const canvas = canvasRef.current
    if (status !== 'ready' || !pdf || !canvas || containerWidth <= 0) return

    let cancelled = false
    setRendering(true)

    async function renderPage(pdf: PDFDocumentProxy, canvas: HTMLCanvasElement) {
      try {
        renderTaskRef.current?.cancel()
        const page = await pdf.getPage(currentPage)
        if (cancelled) return
        const baseViewport = page.getViewport({ scale: 1 })
        const cssScale = computeFitScale(containerWidth, baseViewport.width, zoom)
        const outputScale = Math.min(window.devicePixelRatio || 1, MAX_OUTPUT_SCALE)
        const viewport = page.getViewport({ scale: cssScale })
        canvas.width = Math.max(1, Math.floor(viewport.width * outputScale))
        canvas.height = Math.max(1, Math.floor(viewport.height * outputScale))
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
        const task = page.render({ canvas, transform, viewport })
        renderTaskRef.current = task
        await task.promise
      } catch (error) {
        // Superseded by a newer render or by teardown — expected, not a failure.
        if (!(error instanceof pdfjs.RenderingCancelledException)) throw error
      } finally {
        if (!cancelled) setRendering(false)
      }
    }

    void renderPage(pdf, canvas).catch((error: unknown) => {
      console.error('pdf-reader: failed to render page', error)
      if (!cancelled) setRendering(false)
    })

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [status, currentPage, zoom, containerWidth])

  const canNavigate = status === 'ready' && numPages !== null && numPages > 1

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)}>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2'>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='sm'
            aria-label={t('view.previous')}
            disabled={!canNavigate || currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className='size-4' />
          </Button>
          <span className='min-w-28 text-center text-sm text-text'>
            {numPages
              ? t('view.pageOf', { page: currentPage, total: numPages })
              : t('view.page', { page: currentPage })}
          </span>
          <Button
            variant='outline'
            size='sm'
            aria-label={t('view.next')}
            disabled={!canNavigate || Boolean(numPages && currentPage >= numPages)}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight className='size-4' />
          </Button>
        </div>
        <div className='flex items-center gap-1'>
          {rendering ? <Spinner className='mr-1 size-4' /> : null}
          <Button
            variant='ghost'
            size='sm'
            aria-label={t('view.zoomOut')}
            disabled={status !== 'ready' || zoom <= MIN_ZOOM}
            onClick={() => setZoom((value) => stepZoom(value, 'out'))}
          >
            <ZoomOut className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            aria-label={t('view.zoomReset')}
            disabled={status !== 'ready' || zoom === 1}
            onClick={() => setZoom(1)}
          >
            <RotateCcw className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            aria-label={t('view.zoomIn')}
            disabled={status !== 'ready' || zoom >= MAX_ZOOM}
            onClick={() => setZoom((value) => stepZoom(value, 'in'))}
          >
            <ZoomIn className='size-4' />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className='h-[75vh] overflow-auto bg-surface-2 p-3'>
        {status === 'error' ? (
          <div className='flex h-full flex-col items-center justify-center gap-3 text-center'>
            <p className='text-sm font-semibold text-heading'>{t('view.loadErrorTitle')}</p>
            <p className='max-w-md text-sm text-text'>{t('view.loadErrorDescription')}</p>
            <a className='text-accent underline' href={url} rel='noreferrer' target='_blank'>
              {t('view.openOriginal')}
            </a>
          </div>
        ) : (
          <>
            {status === 'loading' ? (
              <div className='grid h-full place-items-center'>
                <Spinner className='size-6' />
              </div>
            ) : null}
            <canvas
              ref={canvasRef}
              className={cn('mx-auto block rounded-md bg-white shadow-md', status === 'loading' && 'hidden')}
            />
          </>
        )}
      </div>

      {numPages ? (
        <div aria-hidden='true' className='h-1 bg-surface-2'>
          <div
            className='h-full bg-accent transition-all duration-300'
            style={{ width: `${Math.round((currentPage / numPages) * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}
