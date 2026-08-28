import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { AuthProvider } from '@/core/auth/auth-provider'
import i18n from '@/core/i18n/config'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>{children}</AuthProvider>
        </I18nextProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
