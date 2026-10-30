import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Mic, Square, Volume2 } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Card, Label, Select } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import type { Note } from '@/types/base-note'

import { compareSpeech, createSpeechSession, getRecognizer } from '../lib/pronunciation'
import type { Vocabulary } from '../types'

export function PronunciationRecorder({ text, listen }: { text: string; listen: (text: string) => void }) {
  const { t } = useTranslation('english-learning')
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const session = useRef<ReturnType<typeof createSpeechSession> | null>(null)
  const Recognition = getRecognizer()
  const secure = window.isSecureContext

  useEffect(() => () => session.current?.dispose(), [])

  function start() {
    if (!Recognition || !text.trim()) return
    session.current?.dispose()
    window.speechSynthesis?.cancel()
    setTranscript('')
    setError('')
    setRecording(true)
    try {
      session.current = createSpeechSession(new Recognition(), {
        result: setTranscript,
        error: (code) =>
          setError(
            code === 'not-allowed' || code === 'service-not-allowed'
              ? 'permission'
              : code === 'audio-capture'
                ? 'microphone'
                : code === 'network'
                  ? 'network'
                  : code === 'no-speech' || code === 'timeout'
                    ? 'noSpeech'
                    : 'generic'
          ),
        end: () => setRecording(false)
      })
      session.current.start()
    } catch {
      setError('generic')
      setRecording(false)
    }
  }

  const score = compareSpeech(text, transcript)
  return (
    <div className='space-y-4'>
      <p lang='en' className='break-words text-2xl font-semibold text-heading'>
        {text}
      </p>
      {!Recognition && (
        <p role='status' className='text-sm text-text'>
          {t('pronunciation.unsupported')}
        </p>
      )}
      {!secure && (
        <p role='status' className='text-sm text-text'>
          {t('pronunciation.secure')}
        </p>
      )}
      <div className='flex flex-wrap gap-3'>
        <Button
          variant='outline'
          disabled={recording || !text.trim() || !('speechSynthesis' in window)}
          onClick={() => listen(text)}
        >
          <Volume2 className='size-4' />
          {t('listen')}
        </Button>
        {recording ? (
          <Button variant='danger' onClick={() => session.current?.stop()}>
            <Square className='size-4' />
            {t('pronunciation.stop')}
          </Button>
        ) : (
          <Button disabled={!Recognition || !secure || !/[a-z]/i.test(text)} onClick={start}>
            <Mic className='size-4' />
            {t('pronunciation.record')}
          </Button>
        )}
      </div>
      {recording && (
        <p role='status' className='text-sm text-accent'>
          {t('pronunciation.listening')}
        </p>
      )}
      {error && (
        <p role='alert' className='text-sm text-danger'>
          {t(`pronunciation.errors.${error}`)}
        </p>
      )}
      {transcript && (
        <div role='status' className='space-y-3 rounded-xl bg-surface-2 p-4'>
          <p className='text-sm text-text'>{t('pronunciation.heard')}</p>
          <p lang='en' className='break-words text-lg text-heading'>
            {transcript}
          </p>
          <p className='font-semibold text-accent'>{t('pronunciation.score', { score })}</p>
          <p className='text-sm text-text'>{t(score === 100 ? 'pronunciation.matched' : 'pronunciation.retry')}</p>
        </div>
      )}
    </div>
  )
}

export function PronunciationPanel({ words, listen }: { words: Note<Vocabulary>[]; listen: (text: string) => void }) {
  const { t } = useTranslation('english-learning')
  const [text, setText] = useState('Hello, how are you?')
  return (
    <Card className='mx-auto max-w-2xl space-y-5'>
      <h2 className='text-lg font-semibold text-heading'>{t('pronunciation.title')}</h2>
      <p className='text-sm text-text'>{t('pronunciation.description')}</p>
      {words.length > 0 && (
        <div className='space-y-2'>
          <Label htmlFor='pronunciation-saved'>{t('pronunciation.saved')}</Label>
          <Select
            id='pronunciation-saved'
            className='w-full'
            value=''
            onChange={(event) => {
              const selected = words.find((word) => word.id === event.target.value)
              if (selected) setText(selected.word)
            }}
          >
            <option value=''>{t('pronunciation.choose')}</option>
            {words.map((word) => (
              <option value={word.id} key={word.id}>
                {word.word}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className='space-y-2'>
        <Label htmlFor='pronunciation-text'>{t('pronunciation.target')}</Label>
        <Input
          id='pronunciation-text'
          lang='en'
          value={text}
          maxLength={200}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <PronunciationRecorder key={text} text={text} listen={listen} />
      <p className='text-xs text-text'>{t('pronunciation.note')}</p>
    </Card>
  )
}
