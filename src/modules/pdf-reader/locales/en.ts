const en = {
  title: 'PDF Reader',
  subtitle: 'Read PDFs page by page and pick up where you left off',
  fields: {
    title: 'Title',
    url: 'PDF URL',
    totalPages: 'Total pages (optional)'
  },
  list: {
    emptyTitle: 'No documents yet',
    emptyDescription: 'Add a PDF URL to start reading with saved progress.',
    progress: 'Page {{page}} / {{total}}',
    progressUnknown: 'Page {{page}}'
  },
  view: {
    notFound: 'Document not found',
    pageOf: 'Page {{page}} / {{total}}',
    page: 'Page {{page}}',
    previous: 'Previous page',
    next: 'Next page',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Reset zoom',
    loadErrorTitle: 'Could not display this PDF',
    loadErrorDescription: 'The host may block cross-origin requests (CORS), or the link is unreachable.',
    openOriginal: 'Open original PDF'
  },
  create: {
    title: 'Add PDF',
    submit: 'Save PDF'
  }
}

export type Dictionary = typeof en

export default en
