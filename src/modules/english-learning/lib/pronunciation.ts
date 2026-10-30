/** Word error rate comparison of the transcript, not an acoustic pronunciation score. */
export function compareSpeech(expected: string, transcript: string): number {
  const tokens = (text: string) =>
    text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[’']/g, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  const target = tokens(expected)
  const heard = tokens(transcript)
  if (!target.length || !heard.length) return 0
  let previous = Array.from({ length: heard.length + 1 }, (_, index) => index)
  for (let i = 1; i <= target.length; i++) {
    const row = [i]
    for (let j = 1; j <= heard.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (target[i - 1] === heard[j - 1] ? 0 : 1))
    }
    previous = row
  }
  return Math.max(0, Math.round((1 - previous[heard.length] / target.length) * 100))
}

export interface SpeechRecognizer {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

export type RecognizerConstructor = new () => SpeechRecognizer

export function getRecognizer(): RecognizerConstructor | undefined {
  const browser = window as unknown as {
    SpeechRecognition?: RecognizerConstructor
    webkitSpeechRecognition?: RecognizerConstructor
  }
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition
}

/** One bounded microphone session. Disposing prevents stale callbacks after navigation. */
export function createSpeechSession(
  recognition: SpeechRecognizer,
  callbacks: { result: (transcript: string) => void; error: (code: string) => void; end: () => void }
) {
  let settled = false
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const clearTimer = () => clearTimeout(timer)
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (event) => {
    if (disposed || settled) return
    const results = Array.from(event.results).filter((result) => result.isFinal)
    if (!results.length) return
    const transcript = results
      .map((result) => result[0].transcript)
      .join(' ')
      .trim()
    if (!transcript) return
    settled = true
    callbacks.result(transcript)
  }
  recognition.onerror = (event) => {
    if (disposed || settled) return
    settled = true
    callbacks.error(event.error)
  }
  recognition.onend = () => {
    clearTimer()
    if (disposed) return
    if (!settled) callbacks.error('no-speech')
    disposed = true
    callbacks.end()
  }
  return {
    start() {
      try {
        recognition.start()
        timer = setTimeout(() => {
          if (!disposed) {
            if (!settled) callbacks.error('timeout')
            disposed = true
            recognition.abort()
            callbacks.end()
          }
        }, 30_000)
      } catch {
        disposed = true
        callbacks.error('start-failed')
        callbacks.end()
      }
    },
    stop() {
      if (!disposed) recognition.stop()
    },
    dispose() {
      clearTimer()
      disposed = true
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
    }
  }
}
