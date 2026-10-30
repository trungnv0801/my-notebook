import { describe, expect, it } from 'vitest'

import { appModules } from './module.registry'

describe('module.registry', () => {
  it('registers all modules in navigation order', () => {
    expect(appModules.map((module) => module.id)).toEqual([
      'spaced-repetition',
      'recurring-tasks',
      'pdf-reader',
      'english-learning'
    ])
  })

  it('has unique ids and paths', () => {
    const ids = new Set(appModules.map((module) => module.id))
    const paths = new Set(appModules.map((module) => module.path))
    expect(ids.size).toBe(appModules.length)
    expect(paths.size).toBe(appModules.length)
  })

  it('ships en and vi translations for every module', () => {
    for (const module of appModules) {
      expect(Object.keys(module.translations.en)).toContain('title')
      expect(Object.keys(module.translations.vi)).toContain('title')
      expect(module.labelKey).toBe(`${module.namespace}:title`)
      expect(module.collectionName).toMatch(/^[a-zA-Z]+$/)
    }
  })
})
