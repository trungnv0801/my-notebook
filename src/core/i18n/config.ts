import { initReactI18next } from 'react-i18next'

import i18n from 'i18next'

import { appModules } from '@/modules/module.registry'

import enCommon from './locales/en'
import viCommon from './locales/vi'

export type AppLanguage = 'en' | 'vi'

const STORAGE_KEY = 'notebook.language'

function detectLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'vi') return stored
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

// Register every namespace (core 'common' + one per module) up front via `resources`.
// i18next only exposes store mutators like addResourceBundle *after* init() runs,
// so bundles must never be added before this call (i18next v26 assigns them in init).
const resources = {
  en: {
    common: enCommon,
    ...Object.fromEntries(appModules.map((appModule) => [appModule.namespace, appModule.translations.en]))
  },
  vi: {
    common: viCommon,
    ...Object.fromEntries(appModules.map((appModule) => [appModule.namespace, appModule.translations.vi]))
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export function changeLanguage(language: AppLanguage): void {
  localStorage.setItem(STORAGE_KEY, language)
  void i18n.changeLanguage(language)
}

export default i18n
