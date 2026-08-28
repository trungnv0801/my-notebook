import { use } from 'react'

import type { Theme } from './theme-provider'
import { ThemeContext } from './theme-provider'

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
