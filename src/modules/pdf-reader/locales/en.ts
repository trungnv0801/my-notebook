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
