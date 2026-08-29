import { type ComponentType, Suspense } from 'react'

import { createBrowserRouter, Navigate } from 'react-router'

import ForgotPasswordPage from '@/core/auth/pages/forgot-password-page'
import LoginPage from '@/core/auth/pages/login-page'
import ResetPasswordPage from '@/core/auth/pages/reset-password-page'
import { ProtectedRoute } from '@/core/auth/protected-route'
import { Spinner } from '@/core/ui/spinner'
import { appModules } from '@/modules/module.registry'

import AppLayout from './AppLayout'
import NotFoundPage from './not-found-page'

function PageLoader() {
  return (
    <div className='grid place-items-center py-24'>
      <Spinner />
    </div>
  )
}

function suspend(element: ComponentType) {
  const Component = element
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const moduleRoutes = appModules.map((module) => ({
  path: module.path.replace(/^\//, ''),
  children: [
    { index: true, element: suspend(module.element) },
    ...(module.children ?? []).map((child) => ({
      path: child.path,
      element: suspend(child.element)
    }))
  ]
}))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ index: true, element: <Navigate to={appModules[0]!.path} replace /> }, ...moduleRoutes]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
])
