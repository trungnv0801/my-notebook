import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { firestore } from '@/core/firebase/firebase'

import { MAX_IMPORT_WORDS, vocabularyContentError, vocabularyKey } from '../lib/vocabulary-csv'
import type { VocabularyContent } from '../types'

export async function importVocabulary(uid: string, rows: VocabularyContent[]): Promise<number> {
  if (!uid) throw new Error('Not authenticated')
  if (!rows.length || rows.length > MAX_IMPORT_WORDS) throw new Error('Invalid import size')
  if (rows.some(vocabularyContentError) || new Set(rows.map((row) => vocabularyKey(row.word))).size !== rows.length)
    throw new Error('Invalid import rows')
  const batch = writeBatch(firestore)
  const target = collection(firestore, 'users', uid, 'englishVocabulary')
  for (const row of rows) {
    batch.set(doc(target), {
      word: row.word.trim(),
      meaning: row.meaning.trim(),
      phonetic: (row.phonetic ?? '').trim(),
      example: row.example.trim(),
      intervalDays: 0,
      nextReviewAt: null,
      lastReviewedAt: null,
      createdAt: serverTimestamp()
    })
  }
  await batch.commit()
  return rows.length
}
