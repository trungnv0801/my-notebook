import { useEffect, useState } from 'react'

import { useIsMutating } from '@tanstack/react-query'

export type NetworkStatus = 'online' | 'offline' | 'syncing'

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}

export function useNetworkStatus(): NetworkStatus {
  const online = useOnlineStatus()
  const pendingMutations = useIsMutating()
  if (!online) return 'offline'
  return pendingMutations > 0 ? 'syncing' : 'online'
}
