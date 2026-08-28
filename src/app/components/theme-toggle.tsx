import { useTranslation } from 'react-i18next'

import { Moon, Sun } from 'lucide-react'

import { Button } from '@/core/ui/button'

import { useTheme } from '../providers/use-theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('common')
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant='ghost'
      size='sm'
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className='size-4' /> : <Moon className='size-4' />}
    </Button>
  )
}
