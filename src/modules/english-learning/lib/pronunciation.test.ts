// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import { compareSpeech, createSpeechSession, type SpeechRecognizer } from './pronunciation'

afterEach(() => vi.useRealTimers())

describe('speech transcript comparison', () => {
  it('ignores punctuation, case and typographic apostrophes', () => {
    expect(compareSpeech('Hello, how are you?', 'hello how are you')).toBe(100)
    expect(compareSpeech('I’m ready.', "I'm ready")).toBe(100)
  })
  it('penalises missing, substituted and extra words', () => {
    expect(compareSpeech('I like green tea', 'I like tea')).toBe(75)
    expect(compareSpeech('I like green tea', 'I like black tea')).toBe(75)
    expect(compareSpeech('I like tea', 'I really like tea')).toBe(67)
    expect(compareSpeech('tea', 'coffee please')).toBe(0)
    expect(compareSpeech('tea', '')).toBe(0)
    expect(compareSpeech('!!!', 'hello')).toBe(0)
  })
})

function setup() {
  vi.useFakeTimers()
  const recognition: SpeechRecognizer = {
    lang: '',
    continuous: true,
    interimResults: true,
    maxAlternatives: 5,
    onresult: null,
    onerror: null,
    onend: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn()
  }
  const callbacks = { result: vi.fn(), error: vi.fn(), end: vi.fn() }
  return { recognition, callbacks, session: createSpeechSession(recognition, callbacks) }
}

describe('microphone session', () => {
  it('accepts final results and stops without producing a no-speech error', () => {
    const { recognition, callbacks, session } = setup()
    session.start()
    expect(recognition.lang).toBe('en-US')
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'partial' } }] })
    expect(callbacks.result).not.toHaveBeenCalled()
    recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'hello' } }] })
    session.stop()
    expect(recognition.stop).toHaveBeenCalledOnce()
    recognition.onend?.()
    expect(callbacks.result).toHaveBeenCalledWith('hello')
    expect(callbacks.error).not.toHaveBeenCalled()
    expect(callbacks.end).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('reports silence and permission failures without replacing the original error', () => {
    const silent = setup()
    silent.session.start()
    silent.recognition.onend?.()
    expect(silent.callbacks.error).toHaveBeenCalledWith('no-speech')
    const denied = setup()
    denied.session.start()
    denied.recognition.onerror?.({ error: 'not-allowed' })
    denied.recognition.onend?.()
    expect(denied.callbacks.error).toHaveBeenCalledExactlyOnceWith('not-allowed')
  })
  it('aborts after 30 seconds if recognition never finishes', () => {
    const { recognition, callbacks, session } = setup()
    session.start()
    vi.advanceTimersByTime(30_000)
    expect(recognition.abort).toHaveBeenCalledOnce()
    expect(callbacks.error).toHaveBeenCalledWith('timeout')
    expect(callbacks.end).toHaveBeenCalledOnce()
  })
  it('releases the microphone and ignores late events on navigation', () => {
    const { recognition, callbacks, session } = setup()
    session.start()
    const lateResult = recognition.onresult
    const lateEnd = recognition.onend
    session.dispose()
    lateResult?.({ results: [{ isFinal: true, 0: { transcript: 'stale' } }] })
    lateEnd?.()
    vi.advanceTimersByTime(30_000)
    expect(recognition.abort).toHaveBeenCalledOnce()
    expect(callbacks.result).not.toHaveBeenCalled()
    expect(callbacks.end).not.toHaveBeenCalled()
    expect(callbacks.error).not.toHaveBeenCalled()
  })
  it('handles a synchronous start failure', () => {
    const { recognition, callbacks, session } = setup()
    vi.mocked(recognition.start).mockImplementation(() => {
      throw new Error('Unavailable')
    })
    session.start()
    expect(callbacks.error).toHaveBeenCalledWith('start-failed')
    expect(callbacks.end).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
