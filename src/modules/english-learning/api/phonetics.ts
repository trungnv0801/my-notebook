export function readPhonetics(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object' || !('entries' in payload) || !Array.isArray(payload.entries)) return []
  const values = new Set<string>()
  for (const entry of payload.entries) {
    if (!entry || typeof entry !== 'object') continue
    if (!Array.isArray(entry.pronunciations)) continue
    for (const pronunciation of entry.pronunciations) {
      if (!pronunciation || pronunciation.type !== 'ipa') continue
      if (
        Array.isArray(pronunciation.tags) &&
        pronunciation.tags.some((tag: string) => ['uncommon', 'obsolete', 'archaic', 'dialectal'].includes(tag))
      )
        continue
      const value: unknown = pronunciation.text
      if (typeof value !== 'string') continue
      const ipa = value
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .trim()
      if (ipa && ipa.length <= 198) values.add(`/${ipa}/`)
    }
  }
  return [...values].slice(0, 5)
}

export async function fetchPhonetics(word: string, signal?: AbortSignal): Promise<string[]> {
  const input = word.trim().toLowerCase()
  if (!input || input.length > 200) return []
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 10_000)
  try {
    const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(input)}`, {
      signal: controller.signal
    })
    if (response.status === 404) return []
    if (!response.ok) throw new Error('Dictionary unavailable')
    return readPhonetics(await response.json())
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
