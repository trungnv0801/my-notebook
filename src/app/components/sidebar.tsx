import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { NotebookPen, X } from 'lucide-react'

import { cn } from '@/core/ui/cn'
import { appModules } from '@/modules/module.registry'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('common')

  return (
    <>
      {open ? (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden'
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200',
          'md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4'>
          <span className='flex items-center gap-2.5'>
            <span
              aria-hidden='true'
              className='grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'
            >
              <NotebookPen className='size-4.5' />
            </span>
            <span className='font-heading text-base font-bold tracking-tight text-heading'>{t('appName')}</span>
          </span>
          <button
            type='button'
            aria-label={t('layout.menu')}
            className='cursor-pointer rounded-lg p-1.5 text-text transition-colors hover:bg-surface-2 hover:text-heading md:hidden'
            onClick={onClose}
          >
            <X className='size-5' />
          </button>
        </div>
        <nav className='flex-1 space-y-1 overflow-y-auto p-3'>
          <p className='px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-text/60'>
            {t('layout.menu')}
          </p>
          {appModules.map((module) => {
            const Icon = module.icon
            return (
              <NavLink
                key={module.id}
                to={module.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-accent-bg font-semibold text-accent'
                      : 'text-text hover:bg-surface-2 hover:text-heading'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden='true'
                      className={cn(
                        'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent transition-opacity duration-200',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Icon className='size-4 shrink-0' />
                    {t(module.labelKey)}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
