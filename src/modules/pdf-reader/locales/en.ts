const en = {
  title: 'PDF Reader',
  subtitle: 'Read PDFs page by page and pick up where you left off',
  fields: {
    title: 'Title',
    url: 'PDF URL',
    lastReadPage: 'Last read page'
  },
  list: {
    emptyTitle: 'No documents yet',
    emptyDescription: 'Add a PDF URL to start reading with saved progress.',
    progress: 'Page {{page}} / {{total}}',
    progressUnknown: 'Page {{page}}'
  },
  reader: {
    open: 'Read',
    page: 'Page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    enterFullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    openExternally: 'Open in new tab',
    saveProgress: 'Save progress',
    progressSaved: 'Progress saved',
    fullscreenError: 'Fullscreen is not available in this browser.',
    embedHint: 'If the PDF does not appear, its host may not allow embedded viewing.',
    frameTitle: '{{title}} PDF document'
  },
  create: {
    title: 'Add PDF',
    submit: 'Save PDF'
  },
  edit: {
    action: 'Edit',
    title: 'Edit PDF',
    submit: 'Save changes',
    notFound: 'Document not found'
  }
}

export type Dictionary = typeof en

export default en
