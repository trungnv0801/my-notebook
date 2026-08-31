import { useTranslation } from 'react-i18next'

import { Languages } from 'lucide-react'

import { type AppLanguage, changeLanguage } from '@/core/i18n/config'
import { cn } from '@/core/ui/cn'

const options: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' }
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current = (i18n.language.startsWith('vi') ? 'vi' : 'en') as AppLanguage
  const nextLanguage: AppLanguage = current === 'vi' ? 'en' : 'vi'
  const nextLanguageLabel = options.find((option) => option.value === nextLanguage)?.label

  return (
    <>
      <button
        type='button'
        aria-label={`${t('layout.language')}: ${nextLanguageLabel}`}
        title={`${t('layout.language')}: ${nextLanguageLabel}`}
        className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-xs font-bold uppercase tracking-wide text-heading shadow-xs transition-all hover:border-accent/40 hover:bg-accent-bg hover:text-accent active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden'
        onClick={() => changeLanguage(nextLanguage)}
      >
        <Languages aria-hidden='true' className='size-4 text-accent' />
        {current}
      </button>

      <div
        role='group'
        aria-label={t('layout.language')}
        className='hidden shrink-0 items-center rounded-xl border border-border bg-surface-2/80 p-1 shadow-xs sm:inline-flex'
      >
        <Languages aria-hidden='true' className='mx-1.5 size-4 text-accent' />
        {options.map((option) => {
          const isActive = current === option.value

          return (
            <button
              key={option.value}
              type='button'
              aria-pressed={isActive}
              className={cn(
                'h-7 rounded-lg px-2.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                isActive ? 'bg-surface text-accent shadow-xs' : 'text-text hover:bg-surface/60 hover:text-heading'
              )}
              onClick={() => changeLanguage(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
