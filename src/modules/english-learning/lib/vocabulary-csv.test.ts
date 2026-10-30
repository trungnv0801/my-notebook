// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { CSV_TEMPLATE, parseVocabularyCsv } from './vocabulary-csv'

describe('vocabulary CSV import', () => {
  it('reads the UTF-8 template including Vietnamese, IPA and quoted commas', () => {
    const rows = parseVocabularyCsv(CSV_TEMPLATE)
    expect(rows).toHaveLength(2)
    expect(rows[0].content).toEqual({
      word: 'remember',
      meaning: 'nhớ, ghi nhớ',
      phonetic: '/rɪˈmembə/',
      example: 'I remember this word.'
    })
    expect(rows.every((row) => !row.error && !row.duplicate)).toBe(true)
  })
  it('supports reordered headers, optional columns, CRLF and semicolon exports', () => {
    expect(parseVocabularyCsv('Meaning;WORD\r\nhọc;learn\r\n')[0].content).toEqual({
      word: 'learn',
      meaning: 'học',
      phonetic: '',
      example: ''
    })
  })
  it('handles escaped quotes and multiline examples with physical line numbers', () => {
    const rows = parseVocabularyCsv('word,meaning,example\nlearn,học,"I say ""hello"".\nEvery day."\nremember,nhớ,test')
    expect(rows[0].content.example).toBe('I say "hello".\nEvery day.')
    expect(rows[1].line).toBe(4)
  })
  it('ignores blank lines and flags existing or repeated words after normalisation', () => {
    const rows = parseVocabularyCsv('word,meaning\n\n Learn ,học\nlearn,học lại\nNEW   WORD,từ mới\nnew word,từ\n', [
      'LEARN'
    ])
    expect(rows.map((row) => row.duplicate)).toEqual([true, true, false, true])
  })
  it('flags invalid rows without losing valid entries', () => {
    const rows = parseVocabularyCsv(
      'word,meaning\nlearn,\n,nghĩa\nremember,nhớ,extra\n' + 'a'.repeat(201) + ',nghĩa\ngood,tốt'
    )
    expect(rows.map((row) => row.error)).toEqual(['required', 'required', 'columns', 'tooLong', undefined])
  })
  it.each(['word,meaning\n"learn,học', 'word,meaning\nle"arn,học', 'word,meaning\n"learn"x,học'])(
    'rejects malformed quotes',
    (csv) => {
      expect(() => parseVocabularyCsv(csv)).toThrow('invalidCsv')
    }
  )
  it('requires unique headers and at least one vocabulary row', () => {
    expect(() => parseVocabularyCsv('learn,học')).toThrow('headers')
    expect(() => parseVocabularyCsv('word,meaning,word\nlearn,học,test')).toThrow('headers')
    expect(() => parseVocabularyCsv('word,meaning\n')).toThrow('empty')
  })
  it('accepts 200 rows and rejects larger imports', () => {
    const rows = Array.from({ length: 200 }, (_, i) => `word${i},nghĩa`)
    expect(parseVocabularyCsv('word,meaning\n' + rows.join('\n'))).toHaveLength(200)
    expect(() => parseVocabularyCsv('word,meaning\n' + [...rows, 'extra,thêm'].join('\n'))).toThrow('tooMany')
  })
})
