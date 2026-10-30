import { useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'
import { Card, Label } from '@/core/ui/card'
import { Input } from '@/core/ui/input'

import { useImportVocabulary } from '../hooks/use-import-vocabulary'
import { CSV_TEMPLATE, MAX_CSV_BYTES, parseVocabularyCsv } from '../lib/vocabulary-csv'

export function VocabularyImport({ existingWords, onClose }: { existingWords: string[]; onClose: () => void }) {
  const { t } = useTranslation('english-learning')
  const mutation = useImportVocabulary()
  const [source, setSource] = useState('')
  const [filename, setFilename] = useState('')
  const [fileError, setFileError] = useState('')
  const [reading, setReading] = useState(false)
  const [imported, setImported] = useState<number | null>(null)
  const readVersion = useRef(0)
  let error = fileError
  let rows: ReturnType<typeof parseVocabularyCsv> = []
  if (source) {
    try {
      rows = parseVocabularyCsv(source, existingWords)
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'invalidCsv'
    }
  }
  const ready = rows.filter((row) => !row.error && !row.duplicate)
  const invalid = rows.filter((row) => row.error)
  const duplicates = rows.filter((row) => row.duplicate).length
  const busy = reading || mutation.isPending

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'vocabulary-template.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Card className='space-y-4'>
      <h2 className='text-lg font-semibold text-heading'>{t('csv.title')}</h2>
      <p className='text-sm text-text'>{t('csv.help')}</p>
      <div className='flex flex-wrap gap-2'>
        <Button variant='outline' onClick={downloadTemplate}>
          {t('csv.template')}
        </Button>
        <Button variant='ghost' disabled={busy} onClick={onClose}>
          {t('cancel')}
        </Button>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='vocabulary-csv'>{t('csv.file')}</Label>
        <Input
          id='vocabulary-csv'
          type='file'
          accept='.csv,text/csv'
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            const version = ++readVersion.current
            setSource('')
            setFileError('')
            setImported(null)
            mutation.reset()
            setFilename(file?.name ?? '')
            if (!file) return
            if (file.size > MAX_CSV_BYTES) {
              setFileError('fileSize')
              return
            }
            setReading(true)
            void file
              .arrayBuffer()
              .then((buffer) => {
                if (version !== readVersion.current) return
                const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
                if (!text.trim()) setFileError('empty')
                else setSource(text)
              })
              .catch(() => {
                if (version === readVersion.current) setFileError('read')
              })
              .finally(() => {
                if (version === readVersion.current) setReading(false)
              })
          }}
        />
      </div>
      {reading && (
        <p role='status' className='text-sm text-text'>
          {t('csv.reading')}
        </p>
      )}
      {error && (
        <p role='alert' className='text-sm text-danger'>
          {t(`csv.errors.${error}`)}
        </p>
      )}
      {imported !== null ? (
        <p role='status' className='text-sm text-accent'>
          {t('csv.success', { count: imported })}
        </p>
      ) : (
        rows.length > 0 && (
          <>
            <p className='text-sm text-text' aria-live='polite'>
              {t('csv.summary', { ready: ready.length, duplicates, invalid: invalid.length })}
            </p>
            {invalid.length > 0 && (
              <div role='alert' className='space-y-1 text-sm text-danger'>
                <p>{t('csv.fixErrors')}</p>
                {invalid.slice(0, 20).map((row) => (
                  <p key={row.line}>{t('csv.rowError', { line: row.line, reason: t(`csv.errors.${row.error}`) })}</p>
                ))}
              </div>
            )}
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm text-text'>
                <caption className='mb-2 text-left'>{t('csv.preview', { filename })}</caption>
                <thead>
                  <tr>
                    {['word', 'meaning', 'phonetic', 'example'].map((key) => (
                      <th scope='col' key={key} className='p-2'>
                        {t(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ready.slice(0, 20).map((row) => (
                    <tr key={row.line} className='border-t border-border'>
                      <td className='p-2 break-words'>{row.content.word}</td>
                      <td className='p-2 break-words'>{row.content.meaning}</td>
                      <td className='p-2 break-words'>{row.content.phonetic}</td>
                      <td className='max-w-xs p-2 whitespace-pre-wrap break-words'>{row.content.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='text-xs text-text'>{t('csv.previewLimit')}</p>
            <Button
              disabled={busy || !!error || invalid.length > 0 || ready.length === 0}
              onClick={() => {
                void mutation
                  .mutateAsync(ready.map((row) => row.content))
                  .then(setImported)
                  .catch(() => {})
              }}
            >
              {t(mutation.isPending ? 'csv.importing' : 'csv.confirm', { count: ready.length })}
            </Button>
          </>
        )
      )}
      {mutation.isError && (
        <p role='alert' className='text-sm text-danger'>
          {t('csv.saveError')}
        </p>
      )}
    </Card>
  )
}
