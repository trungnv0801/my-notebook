function decodeEntities(text: string): string {
  const entities: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }
  return text.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match
    const code = entity.toLowerCase().startsWith('#x') ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
  })
}

/** Public translation endpoint; no secret API keys are sent from the browser. */
export async function suggestMeaning(word: string, signal?: AbortSignal): Promise<string> {
  const input = word.trim()
  if (!input || input.length > 200) throw new Error('Invalid vocabulary input')
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 10_000)
  try {
    const params = new URLSearchParams({ q: input, langpair: 'en|vi' })
    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, { signal: controller.signal })
    if (!response.ok) throw new Error('Translation service unavailable')
    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null) throw new Error('Invalid translation response')
    const payload = data as {
      responseStatus?: unknown
      quotaFinished?: unknown
      responseData?: { translatedText?: unknown }
    }
    if (Number(payload.responseStatus) !== 200 || payload.quotaFinished === true)
      throw new Error('Translation unavailable')
    const translated = payload.responseData?.translatedText
    if (typeof translated !== 'string') throw new Error('No translation')
    const meaning = decodeEntities(translated).trim()
    if (!meaning || meaning.length > 500 || meaning.toLowerCase() === input.toLowerCase())
      throw new Error('No useful translation')
    return meaning
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
