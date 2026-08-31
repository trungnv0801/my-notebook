import { useTranslation } from 'react-i18next'

import { LogOut, Menu } from 'lucide-react'

import { useAuth } from '@/core/auth/use-auth'
import { OfflineIndicator } from '@/core/offline/offline-indicator'
import { Button } from '@/core/ui/button'
import { ReminderBell } from '@/modules/recurring-tasks/components/reminder-bell'

import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()
  const { t } = useTranslation('common')
  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <header className='sticky top-0 z-20 flex h-14 min-w-0 shrink-0 items-center gap-1 border-b border-border/70 bg-bg/80 px-2 backdrop-blur-md sm:gap-2 sm:px-4'>
      <Button
        variant='ghost'
        size='sm'
        className='shrink-0 px-2.5 md:hidden'
        aria-label={t('layout.menu')}
        onClick={onMenuClick}
      >
        <Menu className='size-5' />
      </Button>
      <span className='hidden min-w-0 truncate font-heading font-bold tracking-tight text-heading min-[420px]:inline md:hidden'>
        {t('appName')}
      </span>
      <div className='ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2 lg:gap-3'>
        <OfflineIndicator />
        <ReminderBell />
        <LanguageSwitcher />
        <ThemeToggle />
        <span className='hidden min-w-0 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-xs sm:inline-flex'>
          <span
            aria-hidden='true'
            className='grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white'
          >
            {initial}
          </span>
          <span className='max-w-44 truncate text-xs font-medium text-text'>{user?.email}</span>
        </span>
        <Button
          variant='ghost'
          size='sm'
          className='px-2.5'
          aria-label={t('auth.signOut')}
          onClick={() => void signOut()}
        >
          <LogOut className='size-4' />
        </Button>
      </div>
    </header>
  )
}
