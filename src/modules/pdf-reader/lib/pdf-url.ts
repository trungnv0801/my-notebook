export function getPdfUrl(url: string, pageNumber: number): string {
  const page = Number.isFinite(pageNumber) ? Math.max(1, Math.floor(pageNumber)) : 1
  const [baseUrl, fragment = ''] = url.split('#', 2)
  const parameters = new URLSearchParams(fragment)
  parameters.set('page', String(page))

  return `${baseUrl}#${parameters.toString()}`
}
