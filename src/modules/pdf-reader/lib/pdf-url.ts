export function getPdfUrl(url: string, pageNumber: number): string {
  const page = Number.isFinite(pageNumber) ? Math.max(1, Math.floor(pageNumber)) : 1
  const [baseUrl, fragment = ''] = getGoogleDrivePreviewUrl(url).split('#', 2)
  const parameters = new URLSearchParams(fragment)
  parameters.set('page', String(page))

  return `${baseUrl}#${parameters.toString()}`
}

function getGoogleDrivePreviewUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== 'drive.google.com') return url

    const filePathMatch = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/)
    const fileId = filePathMatch?.[1] ?? (parsedUrl.pathname === '/open' ? parsedUrl.searchParams.get('id') : null)
    if (!fileId) return url

    parsedUrl.pathname = `/file/d/${fileId}/preview`
    parsedUrl.searchParams.delete('id')
    parsedUrl.hash = ''
    return parsedUrl.toString()
  } catch {
    return url
  }
}
