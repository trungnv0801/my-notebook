import type { ComponentType } from 'react'

import type { LucideIcon } from 'lucide-react'

export interface ModuleTranslations {
  en: Record<string, unknown>
  vi: Record<string, unknown>
}

export interface ModuleRoute {
  path: string
  element: ComponentType
}

export interface AppModule {
  id: string
  path: string
  icon: LucideIcon
  labelKey: string
  navOrder?: number
  namespace: string
  collectionName: string
  element: ComponentType
  children?: ModuleRoute[]
  translations: ModuleTranslations
}
