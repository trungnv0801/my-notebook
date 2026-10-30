// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { suggestMeaning } from './suggest-meaning'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Vietnamese meaning suggestions', () => {
  it('requests English to Vietnamese and decodes translation entities', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseStatus: 200, responseData: { translatedText: ' ghi nh&#7899; &amp; h&#7885;c ' } })
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await suggestMeaning(' remember ')).toBe('ghi nhớ & học')
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('q')).toBe('remember')
    expect(url.searchParams.get('langpair')).toBe('en|vi')
  })
  it.each([
    { responseStatus: 403, responseData: { translatedText: 'Quota exceeded' } },
    { responseStatus: 200, quotaFinished: true, responseData: { translatedText: 'Quota exceeded' } },
    { responseStatus: 200, responseData: { translatedText: 'remember' } },
    { responseStatus: 200, responseData: { translatedText: '' } },
    { responseStatus: 200, responseData: { translatedText: 'a'.repeat(501) } },
    null
  ])('rejects unavailable or unusable suggestions: %j', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }))
    await expect(suggestMeaning('remember')).rejects.toThrow()
  })
  it('does not request empty input', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(suggestMeaning(' ')).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('cancels the request when the word changes', async () => {
    const fetchMock = vi.fn().mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    const request = suggestMeaning('remember', controller.signal)
    const assertion = expect(request).rejects.toThrow('Aborted')
    controller.abort()
    await assertion
  })
  it('times out a stalled service after ten seconds', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
      )
    )
    const assertion = expect(suggestMeaning('remember')).rejects.toThrow('Aborted')
    await vi.advanceTimersByTimeAsync(10_000)
    await assertion
    expect(vi.getTimerCount()).toBe(0)
  })
})
