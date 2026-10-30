export interface Vocabulary {
  word: string
  meaning: string
  example: string
  phonetic?: string
  intervalDays: number
  nextReviewAt: number | null
  lastReviewedAt: number | null
}

export type VocabularyContent = Pick<Vocabulary, 'word' | 'meaning' | 'example' | 'phonetic'>
