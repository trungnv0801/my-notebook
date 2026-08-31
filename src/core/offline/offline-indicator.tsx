import { useTranslation } from 'react-i18next'

import { CloudOff, CloudUpload, Wifi } from 'lucide-react'

import { type NetworkStatus, useNetworkStatus } from './use-network-status'

const icons: Record<NetworkStatus, typeof Wifi> = {
  online: Wifi,
  offline: CloudOff,
  syncing: CloudUpload
}

export function OfflineIndicator() {
  const status = useNetworkStatus()
  const { t } = useTranslation('common')
  const Icon = icons[status]

  if (status === 'online') {
    return (
      <span
        aria-label={t('offline.online')}
        title={t('offline.online')}
        className='inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400'
      >
        <Icon aria-hidden='true' className='size-3.5 shrink-0' />
        <span className='hidden lg:inline'>{t('offline.online')}</span>
      </span>
    )
  }

  return (
    <span
      role='status'
      aria-label={t(`offline.${status}`)}
      title={t(`offline.${status}`)}
      className={`inline-flex items-center gap-1.5 text-xs ${
        status === 'offline' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
      }`}
    >
      <Icon aria-hidden='true' className='size-3.5 shrink-0 animate-pulse' />
      <span className='hidden lg:inline'>{t(`offline.${status}`)}</span>
    </span>
  )
}
