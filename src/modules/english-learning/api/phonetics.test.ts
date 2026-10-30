// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchPhonetics, readPhonetics } from './phonetics'

afterEach(() => vi.unstubAllGlobals())

describe('dictionary IPA', () => {
  it('collects and deduplicates IPA variants from all dictionary entries', () => {
    expect(
      readPhonetics({
        entries: [
          {
            pronunciations: [
              { type: 'ipa', text: '/həˈləʊ/' },
              { type: 'ipa', text: 'həˈləʊ' },
              { type: 'ipa', text: '/hɛˈloʊ/' },
              { type: 'enpr', text: 'ignored' }
            ]
          },
          {
            pronunciations: [
              { type: 'ipa', text: ' /hɛˈloʊ/ ' },
              { type: 'ipa', text: '/rare/', tags: ['uncommon'] }
            ]
          }
        ]
      })
    ).toEqual(['/həˈləʊ/', '/hɛˈloʊ/'])
  })
  it('ignores missing, oversized and malformed values without inventing IPA', () => {
    expect(readPhonetics({ title: 'Not found' })).toEqual([])
    expect(
      readPhonetics({
        entries: [
          null,
          42,
          { pronunciations: [null, 0, { type: 'ipa', text: '' }, { type: 'ipa', text: 'a'.repeat(200) }] }
        ]
      })
    ).toEqual([])
  })
  it('encodes the word safely and passes a cancellation signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ entries: [{ pronunciations: [{ type: 'ipa', text: '/test/' }] }] })
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchPhonetics(' TEST ')).toEqual(['/test/'])
    expect(fetchMock).toHaveBeenCalledWith('https://freedictionaryapi.com/api/v1/entries/en/test', {
      signal: expect.any(AbortSignal)
    })
  })
  it('handles words and phrases missing from the dictionary', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 404, ok: false }))
    expect(await fetchPhonetics('unknown phrase')).toEqual([])
  })
  it('reports service errors for retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }))
    await expect(fetchPhonetics('hello')).rejects.toThrow('Dictionary unavailable')
  })
})
