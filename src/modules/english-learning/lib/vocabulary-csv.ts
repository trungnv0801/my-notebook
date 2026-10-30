import type { VocabularyContent } from '../types'

export const MAX_IMPORT_WORDS = 200
export const MAX_CSV_BYTES = 1_048_576
export const CSV_TEMPLATE =
  '\uFEFFword,meaning,phonetic,example\r\nremember,"nhớ, ghi nhớ",/rɪˈmembə/,I remember this word.\r\nlearn,học,/lɜːn/,I learn English every day.\r\n'

export interface CsvRow {
  line: number
  content: VocabularyContent
  error?: 'required' | 'tooLong' | 'columns'
  duplicate: boolean
}

export function vocabularyKey(word: string) {
  return word.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function vocabularyContentError(content: VocabularyContent): CsvRow['error'] {
  if (!content.word.trim() || !content.meaning.trim()) return 'required'
  if (
    content.word.length > 200 ||
    content.meaning.length > 500 ||
    (content.phonetic?.length ?? 0) > 200 ||
    content.example.length > 2000
  )
    return 'tooLong'
}

function readCsv(text: string, separator: string): { line: number; values: string[] }[] {
  const rows: { line: number; values: string[] }[] = []
  let values: string[] = [],
    value = '',
    quoted = false,
    closed = false,
    line = 1,
    rowLine = 1
  const field = () => {
    values.push(value)
    value = ''
    closed = false
  }
  const row = () => {
    field()
    if (values.some((cell) => cell.trim())) rows.push({ line: rowLine, values })
    values = []
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"'
          i++
        } else {
          quoted = false
          closed = true
        }
      } else {
        value += char
        if (char === '\n') line++
      }
    } else if (char === separator) field()
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row()
      line++
      rowLine = line
    } else if (char === '"') {
      if (value || closed) throw new Error('invalidCsv')
      quoted = true
    } else if (closed) {
      if (char !== ' ' && char !== '\t') throw new Error('invalidCsv')
    } else value += char
  }
  if (quoted) throw new Error('invalidCsv')
  row()
  return rows
}

export function parseVocabularyCsv(text: string, existingWords: Iterable<string> = []): CsvRow[] {
  const source = text.replace(/^\uFEFF/, '')
  let records: ReturnType<typeof readCsv> | undefined
  let syntaxError = false
  for (const delimiter of [',', ';']) {
    try {
      const candidate = readCsv(source, delimiter)
      const headers = candidate[0]?.values.map((value) => value.trim().toLowerCase()) ?? []
      if (headers.includes('word') && headers.includes('meaning')) {
        records = candidate
        break
      }
    } catch {
      syntaxError = true
    }
  }
  if (!records) throw new Error(syntaxError ? 'invalidCsv' : 'headers')
  const headers = records[0].values.map((value) => value.trim().toLowerCase())
  if (new Set(headers).size !== headers.length) throw new Error('headers')
  if (records.length <= 1) throw new Error('empty')
  if (records.length - 1 > MAX_IMPORT_WORDS) throw new Error('tooMany')
  const seen = new Set(Array.from(existingWords, vocabularyKey))
  return records.slice(1).map(({ line, values }) => {
    const get = (name: string) => (values[headers.indexOf(name)] ?? '').trim()
    const content = { word: get('word'), meaning: get('meaning'), phonetic: get('phonetic'), example: get('example') }
    const error = values.length !== headers.length ? 'columns' : vocabularyContentError(content)
    const key = vocabularyKey(content.word)
    const duplicate = !error && seen.has(key)
    if (!error) seen.add(key)
    return { line, content, error, duplicate }
  })
}
