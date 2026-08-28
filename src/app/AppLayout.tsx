import { useState } from 'react'

import { Outlet } from 'react-router'

import { Header } from './components/header'
import { Sidebar } from './components/sidebar'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className='flex min-h-svh'>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
