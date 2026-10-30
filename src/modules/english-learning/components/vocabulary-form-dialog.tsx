import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Plus, X } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Textarea } from '@/core/ui/textarea'
import type { Note } from '@/types/base-note'

import { useVocabularyAction } from '../hooks/use-vocabulary'
import type { Vocabulary } from '../types'
import { MeaningSuggestion } from './meaning-suggestion'
import { WordPhonetics } from './word-phonetics'

export function VocabularyFormDialog({ word, onClose }: { word: Note<Vocabulary> | null; onClose: () => void }) {
  const { t } = useTranslation('english-learning')
  const action = useVocabularyAction()
  const dialog = useRef<HTMLDialogElement>(null)
  const wordInput = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState({
    word: word?.word ?? '',
    phonetic: word?.phonetic ?? '',
    meaning: word?.meaning ?? '',
    example: word?.example ?? ''
  })
  const [lookupWord, setLookupWord] = useState('')

  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    wordInput.current?.focus()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-labelledby='vocabulary-form-title'
      aria-describedby='vocabulary-form-description'
      className='m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface p-0 text-text shadow-lg backdrop:bg-black/60 backdrop:backdrop-blur-sm'
      onCancel={(event) => {
        event.preventDefault()
        if (!action.isPending) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !action.isPending) {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose()
        }
      }}
    >
      <div className='sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface p-5 sm:px-7'>
        <div>
          <h2
            id='vocabulary-form-title'
            className='flex items-center gap-2 font-heading text-xl font-bold text-heading'
          >
            <Plus className='size-5 text-accent' aria-hidden='true' />
            {t(word ? 'edit' : 'add')}
          </h2>
          <p id='vocabulary-form-description' className='mt-2 text-sm leading-6 text-text'>
            {t('ui.formHint')}
          </p>
        </div>
        <Button variant='ghost' size='sm' aria-label={t('ui.close')} disabled={action.isPending} onClick={onClose}>
          <X className='size-5' />
        </Button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void action
            .mutateAsync({ type: 'save', id: word?.id, content })
            .then(onClose)
            .catch(() => {})
        }}
      >
        <div className='grid gap-5 p-5 sm:grid-cols-2 sm:p-7'>
          <div className='space-y-2'>
            <Label htmlFor='english-word'>{t('word')}</Label>
            <Input
              ref={wordInput}
              id='english-word'
              lang='en'
              required
              maxLength={200}
              value={content.word}
              disabled={action.isPending}
              onChange={(event) => {
                setContent({ ...content, word: event.target.value, phonetic: '' })
                setLookupWord('')
              }}
              onBlur={() => setLookupWord(content.word.trim())}
              aria-describedby='english-word-hint'
            />
            <p id='english-word-hint' className='text-xs leading-5 text-text'>
              {t('suggestion.hint')}
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='english-phonetic'>{t('phonetic')}</Label>
            <Input
              id='english-phonetic'
              lang='en'
              maxLength={200}
              value={content.phonetic}
              disabled={action.isPending}
              onChange={(event) => setContent({ ...content, phonetic: event.target.value })}
              aria-describedby='english-phonetic-hint'
            />
            <p id='english-phonetic-hint' className='text-xs leading-5 text-text'>
              {t('ipa.hint')}
            </p>
            {lookupWord && lookupWord === content.word.trim() && !content.phonetic.trim() && (
              <WordPhonetics
                key={lookupWord}
                word={lookupWord}
                disabled={action.isPending}
                onApply={(phonetic) =>
                  setContent((previous) => (previous.word.trim() === lookupWord ? { ...previous, phonetic } : previous))
                }
              />
            )}
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='english-meaning'>{t('meaning')}</Label>
            <Textarea
              id='english-meaning'
              lang='vi'
              required
              maxLength={500}
              value={content.meaning}
              disabled={action.isPending}
              onChange={(event) => setContent({ ...content, meaning: event.target.value })}
            />
            {lookupWord && lookupWord === content.word.trim() && (
              <MeaningSuggestion
                key={lookupWord}
                word={lookupWord}
                disabled={action.isPending}
                onApply={(meaning) =>
                  setContent((previous) => (previous.word.trim() === lookupWord ? { ...previous, meaning } : previous))
                }
              />
            )}
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='english-example'>{t('example')}</Label>
            <Textarea
              id='english-example'
              lang='en'
              maxLength={2000}
              value={content.example}
              disabled={action.isPending}
              onChange={(event) => setContent({ ...content, example: event.target.value })}
            />
          </div>
          {action.isError && (
            <p role='alert' className='text-sm text-danger sm:col-span-2'>
              {t('error')}
            </p>
          )}
        </div>
        <div className='sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-border bg-surface px-5 py-4 sm:px-7'>
          <Button variant='outline' disabled={action.isPending} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type='submit' disabled={action.isPending || !content.word.trim() || !content.meaning.trim()}>
            {t(action.isPending ? 'ui.saving' : word ? 'save' : 'add')}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
