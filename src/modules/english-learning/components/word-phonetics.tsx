import { useTranslation } from 'react-i18next'

import { useQuery } from '@tanstack/react-query'

import { Button } from '@/core/ui/button'

import { fetchPhonetics } from '../api/phonetics'

export function WordPhonetics({
  word,
  phonetic,
  onApply,
  disabled = false
}: {
  word: string
  phonetic?: string
  onApply?: (value: string) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('english-learning')
  const query = useQuery({
    queryKey: ['english-phonetics', word.trim().toLowerCase()],
    queryFn: ({ signal }) => fetchPhonetics(word, signal),
    enabled: !phonetic?.trim() && !!word.trim(),
    staleTime: 7 * 86_400_000,
    retry: false,
    refetchOnWindowFocus: false
  })
  if (phonetic?.trim())
    return (
      <p aria-label={t('phonetic')} className='break-words text-sm text-text'>
        {phonetic}
      </p>
    )
  return (
    <div className='space-y-2 text-sm text-text' aria-live='polite'>
      {query.isFetching ? (
        <p>{t('ipa.loading')}</p>
      ) : query.isError ? (
        <div>
          <p>{t('ipa.error')}</p>
          <Button variant='ghost' size='sm' disabled={disabled} onClick={() => void query.refetch()}>
            {t('suggestion.retry')}
          </Button>
        </div>
      ) : query.data?.length ? (
        <>
          <div className='flex flex-wrap gap-2'>
            {query.data.map((value) =>
              onApply ? (
                <Button key={value} variant='outline' size='sm' disabled={disabled} onClick={() => onApply(value)}>
                  {value}
                </Button>
              ) : (
                <span key={value} aria-label={t('phonetic')}>
                  {value}
                </span>
              )
            )}
          </div>
          <a
            className='text-xs underline'
            href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#English`}
            target='_blank'
            rel='noreferrer'
          >
            Wiktionary · FreeDictionaryAPI.com
          </a>
          <a
            className='text-xs underline'
            href='https://creativecommons.org/licenses/by-sa/4.0/'
            target='_blank'
            rel='noreferrer'
          >
            CC BY-SA 4.0
          </a>
        </>
      ) : (
        <p>{t('ipa.empty')}</p>
      )}
    </div>
  )
}
