import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Brain, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'

import { useAuth } from '@/core/auth/use-auth'
import { formatDate } from '@/core/lib/date-utils'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardTitle, EmptyState } from '@/core/ui/card'
import { PageHeader } from '@/core/ui/page-header'
import { Skeleton } from '@/core/ui/skeleton'
import type { Note } from '@/types/base-note'

import { useDeleteMemory, useMemoies, useReviewMemory, useUpdateMemory } from '../hooks/use-memories'
import type { MemoryStatus, ReviewGrade } from '../lib/schedule'
import { getMemoryStatus, sortByReviewPriority } from '../lib/schedule'
import type { MemoryItem } from '../types'

const GRADE_ORDER: ReviewGrade[] = ['again', 'hard', 'good', 'easy']

const statusBadgeClasses: Record<MemoryStatus, string> = {
  new: 'bg-accent-bg text-accent',
  due: 'bg-danger/10 text-danger',
  scheduled: 'bg-surface-2 text-text'
}

export default function MemoryListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('spaced-repetition')
  const memoriesQuery = useMemoies()
  const removeMemory = useDeleteMemory()
  const updateMemory = useUpdateMemory()
  const reviewMemory = useReviewMemory()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  if (memoriesQuery.isPending) {
    return (
      <section aria-busy='true' className='space-y-6'>
        <PageHeader subtitle={t('subtitle')} title={t('title')} />
        <div className='grid gap-4 sm:grid-cols-2'>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className='h-44' />
          ))}
        </div>
      </section>
    )
  }

  const memories = memoriesQuery.data ?? []
  const dueItems = memories.filter((item) => getMemoryStatus(item) !== 'scheduled').sort(sortByReviewPriority)
  const laterItems = memories
    .filter((item) => getMemoryStatus(item) === 'scheduled')
    .sort(
      (first, second) =>
        (first.nextReviewAt ?? Number.MAX_SAFE_INTEGER) - (second.nextReviewAt ?? Number.MAX_SAFE_INTEGER)
    )

  async function togglePracticeDone(item: Note<MemoryItem>) {
    setBusyId(item.id)
    try {
      await updateMemory.mutateAsync({ memoryId: item.id, patch: { practiceDone: !item.practiceDone } })
    } finally {
      setBusyId(null)
    }
  }

  async function gradeReview(item: Note<MemoryItem>, grade: ReviewGrade) {
    setBusyId(item.id)
    try {
      await reviewMemory.mutateAsync({ memoryId: item.id, item, grade })
    } finally {
      setBusyId(null)
    }
  }

  function deleteItem(item: Note<MemoryItem>) {
    if (!user) return
    setRemovingId(item.id)
    void removeMemory.mutateAsync(item.id).finally(() => setRemovingId(null))
  }

  function renderCard(item: Note<MemoryItem>) {
    const status = getMemoryStatus(item)
    const itemPracticeUrls = item.practiceUrls

    return (
      <Card key={item.id}>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle>{item.title}</CardTitle>
          <div className='flex shrink-0 gap-1'>
            <Button
              variant='ghost'
              size='sm'
              aria-label={t('edit.action')}
              title={t('edit.action')}
              onClick={() => void navigate(`${item.id}/edit`)}
            >
              <Pencil className='size-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              aria-label={t('actions.delete', { ns: 'common' })}
              className='text-text/70 hover:bg-danger/10 hover:text-danger'
              disabled={removeMemory.isPending && removingId === item.id}
              onClick={() => deleteItem(item)}
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        </div>

        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1'>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[status]}`}
          >
            <span aria-hidden='true' className='size-1.5 rounded-full bg-current' />
            {t(`list.status.${status}`)}
          </span>
          {status === 'scheduled' && item.nextReviewAt != null ? (
            <span className='text-xs text-text/80'>
              {t('list.nextReview')}: {formatDate(item.nextReviewAt, i18n.language)}
            </span>
          ) : null}
        </div>

        {itemPracticeUrls.length > 0 ? (
          <div className='mt-4 space-y-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5'>
            <div className='flex flex-col items-start gap-2'>
              {itemPracticeUrls.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1.5 break-all text-sm font-medium text-accent hover:underline'
                >
                  <ExternalLink aria-hidden='true' className='size-4 shrink-0' />
                  {t('list.practice.openNumber', { number: index + 1 })}
                </a>
              ))}
            </div>
            <label className='flex cursor-pointer select-none items-center gap-2 text-sm text-text'>
              <input
                type='checkbox'
                className='size-4 accent-accent'
                checked={item.practiceDone}
                disabled={busyId === item.id}
                onChange={() => void togglePracticeDone(item)}
              />
              {t('list.practice.done')}
            </label>
          </div>
        ) : null}

        {status !== 'scheduled' ? (
          <div className='mt-4 border-t border-border pt-3'>
            <p className='text-xs font-semibold text-heading'>{t('review.prompt')}</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {GRADE_ORDER.map((grade) => (
                <Button
                  key={grade}
                  variant='outline'
                  size='sm'
                  disabled={busyId === item.id}
                  onClick={() => void gradeReview(item, grade)}
                >
                  {t(`review.${grade}`)}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <CardContent className='mt-3 text-xs text-text/80'>
          {t('list.createdAt')}: {formatDate(item.createdAt, i18n.language)}
          {' · '}
          {t('list.reviews')}: {item.repetitions}
          {item.lastReviewedAt != null ? (
            <>
              {' · '}
              {t('list.lastReview')}: {formatDate(item.lastReviewedAt, i18n.language)}
            </>
          ) : null}
        </CardContent>
      </Card>
    )
  }

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

      {memories.length === 0 ? (
        <EmptyState
          icon={<Brain className='size-5' />}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={<Button onClick={() => void navigate('new')}>{t('create.title')}</Button>}
        />
      ) : (
        <>
          <div className='flex flex-wrap gap-2'>
            <span className='rounded-full bg-surface-2 px-3 py-1 text-sm text-text'>
              {t('list.totalCount', { count: memories.length })}
            </span>
            {dueItems.length > 0 ? (
              <span className='rounded-full bg-accent-bg px-3 py-1 text-sm font-medium text-accent'>
                {t('list.dueCount', { count: dueItems.length })}
              </span>
            ) : null}
          </div>

          <div className='space-y-3'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-heading'>{t('list.dueSection')}</h2>
            {dueItems.length === 0 ? (
              <p className='text-sm text-text/80'>{t('list.dueEmpty')}</p>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2'>{dueItems.map(renderCard)}</div>
            )}
          </div>

          <div className='space-y-3'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-heading'>{t('list.laterSection')}</h2>
            {laterItems.length === 0 ? (
              <p className='text-sm text-text/80'>{t('list.laterEmpty')}</p>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2'>{laterItems.map(renderCard)}</div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
