import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ArrowRight, BookOpen, Check, Clock3, FileUp, Headphones, Mic, Plus, Search, Volume2 } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Card, EmptyState } from '@/core/ui/card'
import { cn } from '@/core/ui/cn'
import { Input } from '@/core/ui/input'
import type { Note } from '@/types/base-note'

import { useVocabulary, useVocabularyAction } from '../hooks/use-vocabulary'
import { isDue } from '../lib/review'
import type { Vocabulary } from '../types'
import { PronunciationPanel, PronunciationRecorder } from './pronunciation-panel'
import { VocabularyFormDialog } from './vocabulary-form-dialog'
import { VocabularyImport } from './vocabulary-import'
import { VocabularyTable } from './vocabulary-table'
import { WordPhonetics } from './word-phonetics'

export default function EnglishLearningPage() {
  const { t, i18n } = useTranslation('english-learning')
  const { data: words = [] } = useVocabulary()
  const action = useVocabularyAction()
  const [formOpen, setFormOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Note<Vocabulary> | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [pronouncingId, setPronouncingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [onlyDue, setOnlyDue] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)
  const [mode, setMode] = useState<'vocabulary' | 'practice' | 'pronunciation'>('vocabulary')
  const [queue, setQueue] = useState<Note<Vocabulary>[]>([])
  const [revealed, setRevealed] = useState(false)
  const [speechError, setSpeechError] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      window.clearInterval(timer)
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const due = words.filter((word) => isDue(word, now))
  const current = queue[0]
  const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const filtered = words.filter(
    (item) =>
      `${item.word} ${item.meaning}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) &&
      (!onlyDue || isDue(item, now))
  )

  function listen(word: string) {
    if (!speechSupported) return
    setSpeechError(false)
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') setSpeechError(true)
    }
    window.speechSynthesis.speak(utterance)
  }

  async function grade(remembered: boolean) {
    if (!current) return
    try {
      await action.mutateAsync({ type: 'review', id: current.id, item: current, remembered })
      setQueue((items) => items.slice(1))
      setRevealed(false)
      setPronouncingId(null)
      setNow(Date.now())
    } catch {
      // Keep the card visible so the user can retry the failed save.
    }
  }

  return (
    <section className='space-y-6 lg:space-y-8'>
      <header className='relative overflow-hidden rounded-3xl border border-accent-border bg-surface px-5 py-7 sm:p-8'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-accent-bg to-transparent'
        />
        <div className='relative flex flex-wrap items-start justify-between gap-6'>
          <div className='max-w-xl'>
            <p className='mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent'>
              <BookOpen className='size-4' aria-hidden='true' />
              {t('ui.eyebrow')}
            </p>
            <h1 className='font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl'>{t('title')}</h1>
            <p className='mt-3 max-w-lg text-sm leading-7 text-text sm:text-base'>{t('subtitle')}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              onClick={() => {
                setMode('vocabulary')
                setEditingWord(null)
                setPronouncingId(null)
                setFormOpen(true)
              }}
            >
              <Plus className='size-4' aria-hidden='true' />
              {t('ui.newWord')}
            </Button>
            <Button variant='outline' onClick={() => setImportOpen(true)}>
              <FileUp className='size-4' aria-hidden='true' />
              {t('csv.title')}
            </Button>
          </div>
        </div>
        <dl className='relative mt-7 grid grid-cols-3 gap-3 border-t border-border pt-5 sm:gap-6'>
          {[
            { label: 'ui.saved', value: words.length, icon: BookOpen },
            { label: 'ui.due', value: due.length, icon: Clock3 },
            { label: 'ui.scheduled', value: words.length - due.length, icon: Check }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className='flex min-w-0 items-center gap-3'>
              <span className='hidden size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent sm:flex'>
                <Icon className='size-4' aria-hidden='true' />
              </span>
              <div>
                <dt className='text-xs leading-5 text-text sm:text-sm'>{t(label)}</dt>
                <dd className='mt-1 text-2xl font-semibold tabular-nums tracking-tight text-heading'>
                  {value.toLocaleString(i18n.language)}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </header>
      {formOpen && (
        <VocabularyFormDialog key={editingWord?.id ?? 'new'} word={editingWord} onClose={() => setFormOpen(false)} />
      )}
      {importOpen && (
        <VocabularyImport existingWords={words.map((word) => word.word)} onClose={() => setImportOpen(false)} />
      )}
      <nav
        aria-label={t('ui.modes')}
        className='flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-xs'
      >
        <Button
          variant='ghost'
          aria-pressed={mode === 'vocabulary'}
          className={cn(
            'flex-1 sm:flex-none',
            mode === 'vocabulary' && 'bg-accent-bg text-accent hover:bg-accent-bg hover:text-accent'
          )}
          disabled={action.isPending}
          onClick={() => setMode('vocabulary')}
        >
          <BookOpen className='size-4' />
          {t('vocabulary')}
        </Button>
        <Button
          variant='ghost'
          aria-pressed={mode === 'practice'}
          className={cn(
            'flex-1 sm:flex-none',
            mode === 'practice' && 'bg-accent-bg text-accent hover:bg-accent-bg hover:text-accent'
          )}
          disabled={action.isPending}
          onClick={() => {
            setQueue(words.filter((word) => isDue(word)).sort((a, b) => (a.nextReviewAt ?? 0) - (b.nextReviewAt ?? 0)))
            setRevealed(false)
            setPronouncingId(null)
            action.reset()
            setMode('practice')
          }}
        >
          <Headphones className='size-4' aria-hidden='true' />
          {t('practice', { count: due.length })}
        </Button>
        <Button
          variant='ghost'
          aria-pressed={mode === 'pronunciation'}
          className={cn(
            'flex-1 sm:flex-none',
            mode === 'pronunciation' && 'bg-accent-bg text-accent hover:bg-accent-bg hover:text-accent'
          )}
          disabled={action.isPending}
          onClick={() => setMode('pronunciation')}
        >
          <Mic className='size-4' aria-hidden='true' />
          {t('pronunciation.title')}
        </Button>
      </nav>
      {action.isError && (
        <p role='alert' className='text-sm text-danger'>
          {t('error')}
        </p>
      )}
      {!speechSupported && <p className='text-sm text-text'>{t('speechUnavailable')}</p>}
      {speechError && (
        <p role='alert' className='text-sm text-danger'>
          {t('speechError')}
        </p>
      )}

      {mode === 'pronunciation' ? (
        <PronunciationPanel words={words} listen={listen} />
      ) : mode === 'vocabulary' ? (
        <div className='min-w-0 space-y-4'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
              <h2 className='font-heading text-xl font-bold tracking-tight text-heading'>{t('vocabulary')}</h2>
              <p className='mt-1 text-sm text-text'>{t('ui.results', { count: filtered.length })}</p>
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={onlyDue ? 'ghost' : 'outline'}
                aria-pressed={!onlyDue}
                onClick={() => {
                  setOnlyDue(false)
                  setVisibleCount(12)
                }}
              >
                {t('ui.all')}
              </Button>
              <Button
                size='sm'
                variant={onlyDue ? 'outline' : 'ghost'}
                aria-pressed={onlyDue}
                onClick={() => {
                  setOnlyDue(true)
                  setVisibleCount(12)
                }}
              >
                {t('ui.due')}
              </Button>
            </div>
          </div>
          <div className='relative'>
            <Search
              className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text'
              aria-hidden='true'
            />
            <Input
              className='pl-10'
              aria-label={t('search')}
              placeholder={t('search')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setVisibleCount(12)
              }}
            />
          </div>
          {words.length === 0 ? (
            <EmptyState title={t('empty')} description={t('emptyDescription')} icon={<BookOpen className='size-5' />} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={t('noResults')}
              description={t('ui.noResultsHint')}
              icon={<Search className='size-5' />}
            />
          ) : (
            <VocabularyTable
              words={filtered.slice(0, visibleCount)}
              now={now}
              disabled={action.isPending}
              speechSupported={speechSupported}
              listen={listen}
              pronouncingId={pronouncingId}
              onPronounce={setPronouncingId}
              onEdit={(word) => {
                setEditingWord(word)
                setPronouncingId(null)
                setFormOpen(true)
              }}
              onDelete={(word) => {
                if (!window.confirm(t('confirmDelete', { word: word.word }))) return
                void action.mutateAsync({ type: 'delete', id: word.id }).catch(() => {})
              }}
            />
          )}
          {filtered.length > visibleCount && (
            <Button variant='outline' className='w-full' onClick={() => setVisibleCount((count) => count + 12)}>
              {t('ui.showMore')}
              <ArrowRight className='size-4' aria-hidden='true' />
            </Button>
          )}
        </div>
      ) : current ? (
        <Card
          className='mx-auto max-w-xl space-y-6 border-accent-border px-6 py-10 text-center sm:px-10'
          key={current.id}
        >
          <p className='text-sm text-text' aria-live='polite'>
            {t('remaining', { count: queue.length })}
          </p>
          <h2 lang='en' className='break-words text-3xl font-bold text-heading'>
            {current.word}
          </h2>
          <WordPhonetics word={current.word} phonetic={current.phonetic} />
          <Button variant='ghost' disabled={!speechSupported} onClick={() => listen(current.word)}>
            <Volume2 className='size-4' />
            {t('listen')}
          </Button>
          <div className='space-y-4'>
            <Button
              variant='outline'
              aria-expanded={pronouncingId === `review:${current.id}`}
              aria-controls={`review-pronunciation-${current.id}`}
              onClick={() => setPronouncingId(pronouncingId === `review:${current.id}` ? null : `review:${current.id}`)}
            >
              <Mic className='size-4' aria-hidden='true' />
              {t(pronouncingId === `review:${current.id}` ? 'ipa.close' : 'pronunciation.title')}
            </Button>
            {pronouncingId === `review:${current.id}` && (
              <div
                id={`review-pronunciation-${current.id}`}
                className='space-y-3 rounded-2xl border border-border bg-surface-2 p-4 text-left'
              >
                <PronunciationRecorder key={`${current.id}:${current.word}`} text={current.word} listen={listen} />
                <p className='text-xs text-text'>{t('pronunciation.note')}</p>
              </div>
            )}
          </div>
          {revealed ? (
            <>
              <div className='space-y-2 break-words' aria-live='polite'>
                <p lang='vi' className='text-xl text-heading'>
                  {current.meaning}
                </p>
                <p lang='en' className='italic text-text'>
                  {current.example}
                </p>
              </div>
              <div className='flex flex-wrap justify-center gap-3'>
                <Button variant='outline' disabled={action.isPending} onClick={() => void grade(false)}>
                  {t('again')}
                </Button>
                <Button disabled={action.isPending} onClick={() => void grade(true)}>
                  {t('remembered')}
                </Button>
              </div>
            </>
          ) : (
            <div className='space-y-4'>
              <p className='text-sm text-text'>{t('hint')}</p>
              <Button onClick={() => setRevealed(true)}>{t('reveal')}</Button>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          title={t(words.length ? 'done' : 'empty')}
          description={t(words.length ? 'doneDescription' : 'emptyDescription')}
        />
      )}
    </section>
  )
}
