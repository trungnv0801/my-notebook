import { useTranslation } from 'react-i18next'

import { type AppLanguage, changeLanguage } from '@/core/i18n/config'
import { Select } from '@/core/ui/card'

const options: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' }
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.language.startsWith('vi') ? 'vi' : 'en') as AppLanguage

  return (
    <Select
      aria-label='Language'
      className='h-8 text-sm'
      value={current}
      onChange={(event) => changeLanguage(event.target.value as AppLanguage)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
