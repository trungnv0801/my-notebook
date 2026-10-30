import { useTranslation } from 'react-i18next'

import { useQuery } from '@tanstack/react-query'

import { Button } from '@/core/ui/button'

import { suggestMeaning } from '../api/suggest-meaning'

export function MeaningSuggestion({
  word,
  disabled,
  onApply
}: {
  word: string
  disabled: boolean
  onApply: (meaning: string) => void
}) {
  const { t } = useTranslation('english-learning')
  const query = useQuery({
    queryKey: ['english-meaning', word],
    queryFn: ({ signal }) => suggestMeaning(word, signal),
    staleTime: 86_400_000,
    retry: false,
    refetchOnWindowFocus: false
  })
  return (
    <div
      className='space-y-2 rounded-lg border border-border bg-surface-2 p-3 text-sm'
      aria-live='polite'
      aria-busy={query.isFetching}
    >
      {query.isFetching ? (
        <p className='text-text'>{t('suggestion.loading')}</p>
      ) : query.isError ? (
        <>
          <p className='text-text'>{t('suggestion.error')}</p>
          <Button size='sm' variant='ghost' disabled={disabled} onClick={() => void query.refetch()}>
            {t('suggestion.retry')}
          </Button>
        </>
      ) : query.data ? (
        <>
          <p className='text-xs text-text'>{t('suggestion.title')}</p>
          <p lang='vi' className='break-words text-heading'>
            {query.data}
          </p>
          <Button size='sm' variant='outline' disabled={disabled} onClick={() => onApply(query.data)}>
            {t('suggestion.apply')}
          </Button>
        </>
      ) : null}
      <p className='text-xs text-text'>
        {t('suggestion.source')}{' '}
        <a href='https://mymemory.translated.net/' target='_blank' rel='noreferrer' className='text-accent underline'>
          MyMemory
        </a>
      </p>
    </div>
  )
}
