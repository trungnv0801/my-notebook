import { useEffect, useRef } from 'react'

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
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(
      () => panel.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true }),
      0
    )
    const media = window.matchMedia('(min-width: 768px)')
    const resize = () => {
      if (media.matches) onClose()
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab') return
      const nodes = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!nodes?.length) return
      const first = nodes[0],
        last = nodes[nodes.length - 1]
      if (!panel.current?.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    media.addEventListener('change', resize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', keydown)
      media.removeEventListener('change', resize)
      previousFocus?.focus()
    }
  }, [open, onClose])

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
        ref={panel}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label={t('layout.menu')}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200',
          'md:sticky md:top-0 md:h-dvh md:translate-x-0 md:shrink-0',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full md:visible'
        )}
      >
        <div className='flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4'>
          <span className='flex items-center gap-2.5'>
            <span
              aria-hidden='true'
              className='grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-on-accent shadow-sm'
            >
              <NotebookPen className='size-4.5' />
            </span>
            <span className='font-heading text-base font-bold tracking-tight text-heading'>{t('appName')}</span>
          </span>
          <button
            type='button'
            aria-label={t('layout.menu')}
            className='grid size-11 cursor-pointer place-items-center rounded-xl text-text transition-colors hover:bg-surface-2 hover:text-heading md:hidden'
            onClick={onClose}
          >
            <X className='size-5' />
          </button>
        </div>
        <nav className='flex-1 space-y-1 overflow-y-auto p-3'>
          <p className='px-3 pb-3 pt-4 text-xs font-semibold uppercase tracking-widest text-text'>{t('layout.menu')}</p>
          {appModules.map((module) => {
            const Icon = module.icon
            return (
              <NavLink
                key={module.id}
                to={module.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200',
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
        <div className='m-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs leading-relaxed text-text'>
          {t('layout.workspace')}
        </div>
      </aside>
    </>
  )
}
