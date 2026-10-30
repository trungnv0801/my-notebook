import { describe, expect, it } from 'vitest'

import { getPdfUrl } from './pdf-url'

describe('getPdfUrl', () => {
  it('adds the requested page to a regular PDF URL', () => {
    expect(getPdfUrl('https://example.com/book.pdf', 12)).toBe('https://example.com/book.pdf#page=12')
  })

  it('replaces an existing page while preserving other PDF viewer options', () => {
    expect(getPdfUrl('https://example.com/book.pdf#zoom=page-width&page=2', 8)).toBe(
      'https://example.com/book.pdf#zoom=page-width&page=8'
    )
  })

  it('keeps a Google Drive file in its embeddable preview viewer', () => {
    expect(getPdfUrl('https://drive.google.com/file/d/drive-file-id/preview?usp=sharing', 7)).toBe(
      'https://drive.google.com/file/d/drive-file-id/preview?usp=sharing#page=7'
    )
  })

  it('turns a Google Drive view link into a preview link and preserves its resource key', () => {
    expect(getPdfUrl('https://drive.google.com/file/d/drive-file-id/view?resourcekey=secret-key', 4)).toBe(
      'https://drive.google.com/file/d/drive-file-id/preview?resourcekey=secret-key#page=4'
    )
  })

  it('turns a legacy Google Drive open link into a preview link', () => {
    expect(getPdfUrl('https://drive.google.com/open?id=drive-file-id', 3)).toBe(
      'https://drive.google.com/file/d/drive-file-id/preview#page=3'
    )
  })

  it('normalizes invalid page numbers', () => {
    expect(getPdfUrl('https://example.com/book.pdf', Number.NaN)).toBe('https://example.com/book.pdf#page=1')
    expect(getPdfUrl('https://example.com/book.pdf', -10)).toBe('https://example.com/book.pdf#page=1')
  })
})
