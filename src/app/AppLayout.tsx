import { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { Header } from './components/header'
import { Sidebar } from './components/sidebar'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const { t } = useTranslation('common')

  return (
    <div className='flex min-h-svh'>
      <a
        href='#main-content'
        className='sr-only z-[100] rounded-xl bg-accent px-5 py-3 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4'
      >
        {t('layout.skip')}
      </a>
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main
          id='main-content'
          tabIndex={-1}
          className='mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8'
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
