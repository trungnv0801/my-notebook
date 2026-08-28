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
        <Icon className='size-3.5' />
        {t('offline.online')}
      </span>
    )
  }

  return (
    <span
      role='status'
      className={`inline-flex items-center gap-1.5 text-xs ${
        status === 'offline' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
      }`}
    >
      <Icon className='size-3.5 animate-pulse' />
      {t(`offline.${status}`)}
    </span>
  )
}
