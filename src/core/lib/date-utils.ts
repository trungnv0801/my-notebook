export function formatDate(timestamp: number | null | undefined, locale: string): string {
  if (!timestamp) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(new Date(timestamp))
}

export function formatDateTime(timestamp: number | null | undefined, locale: string): string {
  if (!timestamp) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}
