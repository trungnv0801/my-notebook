import { Navigate, Outlet, useLocation } from 'react-router'

import { Spinner } from '@/core/ui/spinner'

import { useAuth } from './use-auth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='grid min-h-svh place-items-center'>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
