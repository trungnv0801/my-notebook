import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import EnglishLearningPage from './english-learning-page'

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn(), suggestMeaning: vi.fn(), words: [] as object[] }))
vi.mock('../api/suggest-meaning', () => ({ suggestMeaning: mocks.suggestMeaning }))
vi.mock('../api/phonetics', () => ({ fetchPhonetics: async () => ['/rɪˈmembə/'] }))
vi.mock('../hooks/use-vocabulary', () => ({
  useVocabulary: () => ({ data: mocks.words }),
  useVocabularyAction: () => ({ mutateAsync: mocks.mutateAsync, reset: vi.fn(), isPending: false, isError: false })
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } })
}))

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
  mocks.suggestMeaning.mockReset().mockResolvedValue('học')
  mocks.mutateAsync.mockReset().mockResolvedValue(undefined)
  mocks.words = [
    {
      id: 'w1',
      word: 'remember',
      meaning: 'ghi nhớ',
      example: 'Remember me.',
      intervalDays: 0,
      nextReviewAt: null,
      lastReviewedAt: null,
      createdAt: 1
    }
  ]
})
afterEach(cleanup)

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <EnglishLearningPage />
    </QueryClientProvider>
  )
}

describe('English learning page', () => {
  it('shows dictionary IPA and opens a pronunciation check directly on a saved word', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('/rɪˈmembə/')
    const buttons = screen.getAllByRole('button', { name: 'pronunciation.title' })
    const inlineButton = buttons.find((button) => button.hasAttribute('aria-controls'))!
    await user.click(inlineButton)
    expect(screen.getByRole('button', { name: 'pronunciation.record' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ipa.close' })).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'ipa.close' }))
    expect(screen.queryByRole('button', { name: 'pronunciation.record' })).not.toBeInTheDocument()
  })

  it('includes a manually entered IPA when saving vocabulary', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'ui.newWord' }))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('word'), 'learn')
    await user.type(within(screen.getByRole('dialog')).getByLabelText('phonetic'), '/lɜːn/')
    await user.type(within(screen.getByRole('dialog')).getByLabelText('meaning'), 'học')
    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(mocks.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.objectContaining({ word: 'learn', phonetic: '/lɜːn/' }) })
    )
  })
  it('hides answers until revealed and advances after a successful review', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'practice' }))
    expect(screen.queryByText('ghi nhớ')).not.toBeInTheDocument()
    const pronunciationButton = screen
      .getAllByRole('button', { name: 'pronunciation.title' })
      .find((button) => button.getAttribute('aria-controls')?.startsWith('review-pronunciation-'))!
    await user.click(pronunciationButton)
    expect(screen.getByRole('button', { name: 'pronunciation.record' })).toBeInTheDocument()
    expect(screen.queryByText('ghi nhớ')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'reveal' }))
    expect(screen.getByText('ghi nhớ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'remembered' }))
    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'pronunciation.record' })).not.toBeInTheDocument()
    expect(mocks.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'review', id: 'w1', remembered: true })
    )
  })

  it('keeps the revealed card available when saving a review fails', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Save failed'))
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'practice' }))
    await user.click(screen.getByRole('button', { name: 'reveal' }))
    await user.click(screen.getByRole('button', { name: 'again' }))
    expect(screen.getByText('ghi nhớ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'again' })).toBeEnabled()
    expect(screen.queryByText('done')).not.toBeInTheDocument()
  })

  it('submits vocabulary content and clears the form after saving', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'ui.newWord' }))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('word'), 'learn')
    await user.type(within(screen.getByRole('dialog')).getByLabelText('meaning'), 'học')
    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      type: 'save',
      id: undefined,
      content: { word: 'learn', meaning: 'học', example: '', phonetic: '' }
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('suggests on blur and preserves the typed meaning until explicitly applied', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'ui.newWord' }))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('word'), 'learn')
    expect(mocks.suggestMeaning).not.toHaveBeenCalled()
    await user.type(within(screen.getByRole('dialog')).getByLabelText('meaning'), 'my own meaning')
    await screen.findByRole('button', { name: 'suggestion.apply' })
    expect(within(screen.getByRole('dialog')).getByLabelText('meaning')).toHaveValue('my own meaning')
    await user.click(screen.getByRole('button', { name: 'suggestion.apply' }))
    expect(within(screen.getByRole('dialog')).getByLabelText('meaning')).toHaveValue('học')
  })

  it('discards suggestions for a previous English word', async () => {
    let resolve!: (meaning: string) => void
    mocks.suggestMeaning.mockImplementationOnce(
      () =>
        new Promise<string>((done) => {
          resolve = done
        })
    )
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'ui.newWord' }))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('word'), 'learn')
    await user.tab()
    await waitFor(() => expect(mocks.suggestMeaning).toHaveBeenCalled())
    await user.clear(within(screen.getByRole('dialog')).getByLabelText('word'))
    await user.type(within(screen.getByRole('dialog')).getByLabelText('word'), 'remember')
    resolve('học')
    expect(screen.queryByRole('button', { name: 'suggestion.apply' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByLabelText('meaning')).toHaveValue('')
  })
})
