import { describe, expect, it } from 'vitest'

import { clampPage, computeFitScale, MAX_ZOOM, MIN_ZOOM, stepZoom } from './pdf-utils'

describe('clampPage', () => {
  it('keeps valid whole pages unchanged', () => {
    expect(clampPage(1, 10)).toBe(1)
    expect(clampPage(3, 10)).toBe(3)
    expect(clampPage(10, 10)).toBe(10)
  })

  it('floors fractional input to a whole page', () => {
    expect(clampPage(2.9, 10)).toBe(2)
  })

  it('clamps out-of-range pages into 1..totalPages', () => {
    expect(clampPage(0, 10)).toBe(1)
    expect(clampPage(-5, 10)).toBe(1)
    expect(clampPage(11, 10)).toBe(10)
  })

  it('only enforces the lower bound while the total is unknown', () => {
    expect(clampPage(42, null)).toBe(42)
    expect(clampPage(-1, null)).toBe(1)
    expect(clampPage(Number.NaN, null)).toBe(1)
  })
})

describe('stepZoom', () => {
  it('multiplies by the fixed step zooming in and divides zooming out', () => {
    expect(stepZoom(1, 'in')).toBeCloseTo(1.25)
    expect(stepZoom(1.25, 'out')).toBeCloseTo(1)
  })

  it('never leaves the supported zoom range', () => {
    expect(stepZoom(MAX_ZOOM, 'in')).toBe(MAX_ZOOM)
    expect(stepZoom(MIN_ZOOM, 'out')).toBe(MIN_ZOOM)
  })

  it('rounds away floating point drift', () => {
    expect(stepZoom(1.1, 'in')).toBe(1.38)
  })
})

describe('computeFitScale', () => {
  it('scales the page to fill the container width times the zoom', () => {
    expect(computeFitScale(600, 300, 1)).toBe(2)
    expect(computeFitScale(600, 300, 1.5)).toBe(3)
  })

  it('falls back to the raw zoom before layout measurements exist', () => {
    expect(computeFitScale(0, 300, 1.2)).toBe(1.2)
    expect(computeFitScale(600, 0, 1.2)).toBe(1.2)
  })
})
