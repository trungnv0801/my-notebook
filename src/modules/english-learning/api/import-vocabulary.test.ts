// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { importVocabulary } from './import-vocabulary'

const mocks = vi.hoisted(() => ({ set: vi.fn(), commit: vi.fn(), collection: vi.fn(), doc: vi.fn() }))
vi.mock('@/core/firebase/firebase', () => ({ firestore: 'firestore' }))
vi.mock('firebase/firestore', () => ({
  collection: mocks.collection,
  doc: mocks.doc,
  serverTimestamp: () => 'server-time',
  writeBatch: () => ({ set: mocks.set, commit: mocks.commit })
}))
const rows = [
  { word: 'learn', meaning: 'học', phonetic: '/lɜːn/', example: 'I learn English.' },
  { word: 'remember', meaning: 'nhớ', example: '' }
]
beforeEach(() => {
  vi.clearAllMocks()
  mocks.commit.mockResolvedValue(undefined)
  mocks.collection.mockReturnValue('user-vocabulary')
  mocks.doc.mockReturnValueOnce('new-id-1').mockReturnValueOnce('new-id-2')
})
describe('atomic vocabulary import', () => {
  it('writes all words to the signed-in user in one commit with fresh review state', async () => {
    expect(await importVocabulary('alice', rows)).toBe(2)
    expect(mocks.collection).toHaveBeenCalledWith('firestore', 'users', 'alice', 'englishVocabulary')
    expect(mocks.set).toHaveBeenCalledTimes(2)
    expect(mocks.set).toHaveBeenCalledWith('new-id-2', {
      word: 'remember',
      meaning: 'nhớ',
      phonetic: '',
      example: '',
      intervalDays: 0,
      nextReviewAt: null,
      lastReviewedAt: null,
      createdAt: 'server-time'
    })
    expect(mocks.commit).toHaveBeenCalledOnce()
  })
  it('rejects invalid or duplicate content before committing any rows', async () => {
    await expect(importVocabulary('alice', [rows[0], { ...rows[1], meaning: '' }])).rejects.toThrow()
    await expect(importVocabulary('alice', [rows[0], { ...rows[0], word: ' LEARN ' }])).rejects.toThrow()
    await expect(importVocabulary('alice', [])).rejects.toThrow()
    await expect(importVocabulary('', rows)).rejects.toThrow()
    expect(mocks.commit).not.toHaveBeenCalled()
    expect(mocks.set).not.toHaveBeenCalled()
  })
  it('propagates failed commits instead of reporting an imported count', async () => {
    mocks.commit.mockRejectedValueOnce(new Error('permission-denied'))
    await expect(importVocabulary('alice', rows)).rejects.toThrow('permission-denied')
    expect(mocks.commit).toHaveBeenCalledOnce()
  })
})
