const en = {
  title: 'Spaced Repetition',
  subtitle: 'Group your quiz links and review them on an expanding schedule',
  fields: {
    title: 'Title',
    quizUrls: 'Quiz links',
    quizUrlNumber: 'Quiz link {{number}}'
  },
  list: {
    emptyTitle: 'Nothing saved yet',
    emptyDescription: 'Add a title and one or more quiz links to start reviewing.',
    totalCount_one: '{{count}} item',
    totalCount_other: '{{count}} items',
    dueCount_one: '{{count}} due for review',
    dueCount_other: '{{count}} due for review',
    dueSection: 'Review now',
    dueEmpty: 'All caught up — nothing awaits review.',
    laterSection: 'Scheduled',
    laterEmpty: 'No upcoming reviews yet.',
    createdAt: 'Created',
    reviews: 'Reviews',
    nextReview: 'Next review',
    lastReview: 'Last reviewed',
    status: {
      new: 'New',
      due: 'Due',
      scheduled: 'Scheduled'
    },
    quiz: {
      openNumber: 'Open quiz {{number}}',
      done: 'All quizzes done'
    }
  },
  review: {
    prompt: 'How well did it stick?',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy'
  },
  memoryForm: {
    addQuizLink: 'Add quiz link',
    removeQuizLink: 'Remove quiz link {{number}}',
    errors: {
      quizUrl: 'Enter a valid http(s) link, e.g. https://example.com/quiz.'
    }
  },
  create: {
    title: 'New quiz set',
    submit: 'Save quiz set'
  },
  edit: {
    action: 'Edit quiz set',
    title: 'Edit quiz set',
    submit: 'Save changes',
    notFound: 'Quiz set not found'
  }
}

export type Dictionary = typeof en

export default en
