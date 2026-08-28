// Pure helpers for the pdf.js canvas viewer — kept DOM-free so they stay
// unit-testable without jsdom.

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 3
const ZOOM_STEP = 1.25

/** Clamp a 1-based page number into [1, totalPages]; unknown total only enforces ≥ 1. */
export function clampPage(page: number, totalPages: number | null): number {
  if (!Number.isFinite(page)) return 1
  const floored = Math.max(Math.floor(page), 1)
  if (!totalPages || totalPages < 1) return floored
  return Math.min(floored, totalPages)
}

/** Multiply/divide the current zoom by a fixed step, clamped to the supported range. */
export function stepZoom(current: number, direction: 'in' | 'out'): number {
  const next = direction === 'in' ? current * ZOOM_STEP : current / ZOOM_STEP
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2))))
}

/**
 * Scale that fits a page rendered at pageViewportWidth CSS pixels into
 * containerWidth, multiplied by the user zoom. Falls back to the raw zoom
 * while layout measurements are not available yet.
 */
export function computeFitScale(containerWidth: number, pageViewportWidth: number, zoom: number): number {
  if (containerWidth <= 0 || pageViewportWidth <= 0) return zoom
  return (containerWidth / pageViewportWidth) * zoom
}
