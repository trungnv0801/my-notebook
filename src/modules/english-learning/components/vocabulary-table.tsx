import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Clock3, Mic, Pencil, Trash2, Volume2 } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { cn } from '@/core/ui/cn'
import type { Note } from '@/types/base-note'

import { isDue } from '../lib/review'
import type { Vocabulary } from '../types'
import { PronunciationRecorder } from './pronunciation-panel'
import { WordPhonetics } from './word-phonetics'

interface Props {
  words: Note<Vocabulary>[]
  now: number
  disabled: boolean
  speechSupported: boolean
  pronouncingId: string | null
  onPronounce: (id: string | null) => void
  listen: (text: string) => void
  onEdit: (word: Note<Vocabulary>) => void
  onDelete: (word: Note<Vocabulary>) => void
}

export function VocabularyTable({
  words,
  now,
  disabled,
  speechSupported,
  pronouncingId,
  onPronounce,
  listen,
  onEdit,
  onDelete
}: Props) {
  const { t, i18n } = useTranslation('english-learning')
  return (
    <div className='space-y-2'>
      <p className='text-xs text-text lg:hidden'>{t('ui.tableHint')}</p>
      <div
        data-table-scroll
        tabIndex={0}
        role='region'
        aria-label={t('vocabulary')}
        className='overflow-x-auto rounded-2xl border border-border bg-surface shadow-xs focus-visible:outline-2 focus-visible:outline-accent'
      >
        <table className='w-full min-w-[960px] border-collapse text-left text-sm'>
          <caption className='sr-only'>{t('vocabulary')}</caption>
          <thead className='border-b border-border bg-surface-2 text-xs font-semibold text-text'>
            <tr>
              {['ui.wordColumn', 'ui.ipaColumn', 'meaning', 'example', 'ui.actionsColumn'].map((key) => (
                <th key={key} scope='col' className='px-5 py-4'>
                  {t(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <Fragment key={word.id}>
                <tr
                  className={cn(
                    'group border-b border-border align-top transition-colors hover:bg-surface-2/60',
                    pronouncingId === word.id && 'bg-accent-bg'
                  )}
                >
                  <th scope='row' className='w-[18%] min-w-40 px-5 py-4 font-normal'>
                    <p lang='en' className='font-heading text-base font-bold text-heading [overflow-wrap:anywhere]'>
                      {word.word}
                    </p>
                    <p
                      className={cn(
                        'mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs',
                        isDue(word, now) ? 'bg-accent-bg text-accent' : 'bg-surface-2 text-text'
                      )}
                    >
                      <Clock3 className='size-3 shrink-0' aria-hidden='true' />
                      {isDue(word, now)
                        ? t('due')
                        : t('scheduled', { date: new Date(word.nextReviewAt!).toLocaleDateString(i18n.language) })}
                    </p>
                  </th>
                  <td className='w-[16%] px-5 py-4 [overflow-wrap:anywhere]'>
                    <WordPhonetics word={word.word} phonetic={word.phonetic} />
                  </td>
                  <td lang='vi' className='w-[20%] px-5 py-4 leading-6 text-heading [overflow-wrap:anywhere]'>
                    {word.meaning}
                  </td>
                  <td lang='en' className='px-5 py-4 whitespace-pre-wrap leading-6 text-text [overflow-wrap:anywhere]'>
                    {word.example || '—'}
                  </td>
                  <td className='w-60 px-4 py-3'>
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={t('listen')}
                        title={t('listen')}
                        disabled={!speechSupported}
                        onClick={() => listen(word.word)}
                      >
                        <Volume2 className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={t(pronouncingId === word.id ? 'ipa.close' : 'pronunciation.title')}
                        title={t('pronunciation.title')}
                        aria-expanded={pronouncingId === word.id}
                        aria-controls={`word-pronunciation-${word.id}`}
                        onClick={(event) => {
                          onPronounce(pronouncingId === word.id ? null : word.id)
                          event.currentTarget.closest('[data-table-scroll]')?.scrollTo({ left: 0 })
                        }}
                      >
                        <Mic className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={t('edit')}
                        title={t('edit')}
                        disabled={disabled}
                        onClick={() => onEdit(word)}
                      >
                        <Pencil className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={t('delete')}
                        title={t('delete')}
                        className='text-danger hover:bg-danger/10 hover:text-danger'
                        disabled={disabled}
                        onClick={() => onDelete(word)}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
                {pronouncingId === word.id && (
                  <tr className='border-b border-border bg-surface-2/50'>
                    <td colSpan={5} className='p-5'>
                      <div id={`word-pronunciation-${word.id}`} className='w-[min(32rem,calc(100vw-4rem))] space-y-3'>
                        <PronunciationRecorder key={`${word.id}:${word.word}`} text={word.word} listen={listen} />
                        <p className='text-xs text-text'>{t('pronunciation.note')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
